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
import { createAuthController } from "./controller.js";
import { assertCourseOwnership } from "./middleware.js";

const SECRET = "test-secret-that-is-at-least-32-characters";

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

test("hashes and verifies passwords without exposing the original", async () => {
  const hash = await hashPassword("correct horse battery staple");
  assert.notEqual(hash, "correct horse battery staple");
  assert.equal(await verifyPassword("correct horse battery staple", hash), true);
  assert.equal(await verifyPassword("wrong password", hash), false);
});

test("creates and verifies a JWT containing only safe user claims", () => {
  const token = createAccessToken(
    { _id: "user-1", name: "Ada", email: "ada@example.com", role: "student", passwordHash: "secret" },
    { secret: SECRET }
  );
  const claims = verifyAccessToken(token, SECRET);

  assert.equal(claims.sub, "user-1");
  assert.equal(claims.role, "student");
  assert.equal(claims.passwordHash, undefined);
});

test("validates registration input and normalizes email", () => {
  const result = validateRegistrationInput({
    name: " Ada ",
    email: "ADA@EXAMPLE.COM ",
    password: "password123",
    role: "student",
  });

  assert.deepEqual(result.value, {
    name: "Ada",
    email: "ada@example.com",
    password: "password123",
    role: "student",
  });
  assert.equal(validateRegistrationInput({ ...result.value, password: "short" }).valid, false);
});

test("auth controller hashes registration passwords and returns a token", async () => {
  let createdUser;
  const User = {
    findOne: () => ({ lean: async () => null }),
    create: async (value) => {
      createdUser = { ...value, _id: "user-1" };
      return createdUser;
    },
  };
  const controller = createAuthController({ User, jwtSecret: SECRET });
  const res = responseDouble();

  await controller.register(
    {
      body: {
        name: "Ada",
        email: "ADA@example.com",
        password: "password123",
        role: "student",
      },
    },
    res,
    assert.fail
  );

  assert.equal(res.statusCode, 201);
  assert.equal(createdUser.passwordHash.startsWith("$2"), true);
  assert.equal(res.body.user.passwordHash, undefined);
  assert.equal(typeof res.body.token, "string");
});

test("auth controller rejects invalid credentials generically", async () => {
  const passwordHash = await hashPassword("password123");
  const User = {
    findOne: () => ({
      lean: async () => ({
        _id: "user-1",
        name: "Ada",
        email: "ada@example.com",
        role: "student",
        passwordHash,
      }),
    }),
  };
  const controller = createAuthController({ User, jwtSecret: SECRET });
  const res = responseDouble();

  await controller.login({ body: { email: "ada@example.com", password: "wrongpass" } }, res, assert.fail);

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { message: "Invalid email or password." });
});

test("course ownership is limited to the owning instructor", () => {
  assert.equal(
    assertCourseOwnership({ sub: "instructor-1", role: "instructor" }, { instructorId: "instructor-1" }),
    true
  );
  assert.equal(
    assertCourseOwnership({ sub: "student-1", role: "student" }, { instructorId: "instructor-1" }),
    false
  );
});

test("sanitizes users before sending them to clients", () => {
  assert.deepEqual(
    sanitizeUser({ _id: "user-1", name: "Ada", email: "ada@example.com", role: "student", passwordHash: "secret" }),
    { id: "user-1", name: "Ada", email: "ada@example.com", role: "student" }
  );
});
