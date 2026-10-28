import assert from "node:assert/strict";
import test from "node:test";
import {
  createAccessToken,
  hashPassword,
  sanitizeUser,
  validateRegistrationInput,
  verifyAccessToken,
  verifyPassword,
} from "./auth.js";
import { assertCourseOwnership } from "./middleware.js";
import { createAuthController } from "./controller.js";

const SECRET = "test-secret-with-at-least-thirty-two-characters";

function responseDouble() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(value) {
      this.body = value;
      return this;
    },
  };
}

test("hashes and verifies passwords", async () => {
  const hash = await hashPassword("password123");
  assert.notEqual(hash, "password123");
  assert.equal(await verifyPassword("password123", hash), true);
  assert.equal(await verifyPassword("wrongpass", hash), false);
});

test("signs safe JWT claims and verifies the token", () => {
  const token = createAccessToken(
    { _id: "user-1", name: "Ada", email: "ada@example.com", role: "student", passwordHash: "secret" },
    { secret: SECRET }
  );
  const claims = verifyAccessToken(token, SECRET);
  assert.deepEqual(
    { sub: claims.sub, email: claims.email, role: claims.role, passwordHash: claims.passwordHash },
    { sub: "user-1", email: "ada@example.com", role: "student", passwordHash: undefined }
  );
});

test("validates and normalizes registration input", () => {
  const result = validateRegistrationInput({
    name: " Ada ",
    email: "ADA@EXAMPLE.COM ",
    password: "password123",
    role: "student",
  });
  assert.equal(result.valid, true);
  assert.deepEqual(result.value, {
    name: "Ada",
    email: "ada@example.com",
    password: "password123",
    role: "student",
  });
  assert.equal(validateRegistrationInput({ ...result.value, password: "short" }).valid, false);
});

test("registers users with a password hash and safe response", async () => {
  let created;
  const User = {
    findOne: () => ({ lean: async () => null }),
    create: async (value) => {
      created = { ...value, _id: "user-1" };
      return created;
    },
  };
  const res = responseDouble();
  await createAuthController({ User, jwtSecret: SECRET }).register(
    { body: { name: "Ada", email: "ada@example.com", password: "password123", role: "student" } },
    res,
    assert.fail
  );
  assert.equal(res.statusCode, 201);
  assert.equal(created.passwordHash.startsWith("$2"), true);
  assert.equal(res.body.user.passwordHash, undefined);
  assert.equal(typeof res.body.token, "string");
});

test("rejects invalid credentials without revealing account state", async () => {
  const hash = await hashPassword("password123");
  const User = {
    findOne: () => ({
      lean: async () => ({
        _id: "user-1",
        name: "Ada",
        email: "ada@example.com",
        role: "student",
        passwordHash: hash,
      }),
    }),
  };
  const res = responseDouble();
  await createAuthController({ User, jwtSecret: SECRET }).login(
    { body: { email: "ada@example.com", password: "wrongpass" } },
    res,
    assert.fail
  );
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { message: "Invalid email or password." });
});

test("allows only the owning instructor to mutate a course", () => {
  assert.equal(
    assertCourseOwnership({ sub: "instructor-1", role: "instructor" }, { instructorId: "instructor-1" }),
    true
  );
  assert.equal(
    assertCourseOwnership({ sub: "other", role: "instructor" }, { instructorId: "instructor-1" }),
    false
  );
  assert.equal(
    assertCourseOwnership({ sub: "student-1", role: "student" }, { instructorId: "instructor-1" }),
    false
  );
});

test("sanitizes password hashes from user responses", () => {
  assert.deepEqual(
    sanitizeUser({ _id: "user-1", name: "Ada", email: "ada@example.com", role: "student", passwordHash: "secret" }),
    { id: "user-1", name: "Ada", email: "ada@example.com", role: "student" }
  );
});
