const assert = require("node:assert/strict");
const test = require("node:test");
const bcrypt = require("bcryptjs");
const { generateToken, verifyToken, sanitizeUser } = require("../utils/jwt");
const {
  authenticate,
  authorize,
  assertCourseOwnership,
} = require("../middleware/authMiddleware");

test("hashes and verifies passwords with bcryptjs", async () => {
  const plainPassword = "securePassword123";
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(plainPassword, salt);

  assert.notEqual(hash, plainPassword);
  assert.equal(await bcrypt.compare(plainPassword, hash), true);
  assert.equal(await bcrypt.compare("wrongpass", hash), false);
});

test("generates and verifies JWT token correctly", () => {
  const mockUser = {
    _id: "user12345",
    name: "Dr. Turing",
    email: "turing@edustream.io",
    role: "instructor",
    password: "secret_should_not_leak",
  };

  const token = generateToken(mockUser);
  assert.equal(typeof token, "string");

  const claims = verifyToken(token);
  assert.equal(claims.sub, "user12345");
  assert.equal(claims.email, "turing@edustream.io");
  assert.equal(claims.role, "instructor");
  assert.equal(claims.password, undefined);
});

test("sanitizes user object safely", () => {
  const raw = {
    _id: "usr_abc123",
    name: "Alice",
    email: "alice@test.com",
    role: "student",
    password: "hashedPasswordHere",
    __v: 0,
  };

  const safe = sanitizeUser(raw);
  assert.deepEqual(safe, {
    id: "usr_abc123",
    name: "Alice",
    email: "alice@test.com",
    role: "student",
  });
  assert.equal(safe.password, undefined);
});

test("middleware: authenticates valid Bearer token", () => {
  const mockUser = { id: "u1", name: "Bob", email: "bob@test.com", role: "student" };
  const token = generateToken(mockUser);

  let nextCalled = false;
  const req = {
    get: (header) => (header.toLowerCase() === "authorization" ? `Bearer ${token}` : null),
    headers: {},
  };
  const res = {
    status: () => res,
    json: () => res,
  };

  authenticate(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.user.sub, "u1");
  assert.equal(req.user.role, "student");
});

test("middleware: rejects missing or invalid Bearer token with 401", () => {
  let statusCode = 0;
  let jsonBody = null;

  const res = {
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (body) => {
      jsonBody = body;
      return res;
    },
  };

  // Missing header
  authenticate({ get: () => null, headers: {} }, res, () => assert.fail("Should not call next"));
  assert.equal(statusCode, 401);
  assert.equal(jsonBody.message, "Authentication required.");

  // Invalid token
  authenticate(
    { get: () => "Bearer invalid.token.value", headers: {} },
    res,
    () => assert.fail("Should not call next")
  );
  assert.equal(statusCode, 401);
  assert.equal(jsonBody.message, "Invalid or expired access token.");
});

test("middleware: authorize allows correct roles and blocks others with 403", () => {
  const instructorOnly = authorize("instructor");

  let allowed = false;
  instructorOnly({ user: { role: "instructor" } }, {}, () => {
    allowed = true;
  });
  assert.equal(allowed, true);

  let statusCode = 0;
  let jsonBody = null;
  const res = {
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (body) => {
      jsonBody = body;
      return res;
    },
  };

  instructorOnly({ user: { role: "student" } }, res, () => assert.fail("Should not call next"));
  assert.equal(statusCode, 403);
  assert.equal(jsonBody.message, "You do not have permission for this action.");
});

test("course ownership logic correctly verifies owners and blocks others", () => {
  const owner = { sub: "inst_1", role: "instructor" };
  const nonOwner = { sub: "inst_2", role: "instructor" };
  const student = { sub: "stu_1", role: "student" };
  const course = { id: "c1", instructorId: "inst_1" };

  assert.equal(assertCourseOwnership(owner, course), true);
  assert.equal(assertCourseOwnership(nonOwner, course), false);
  assert.equal(assertCourseOwnership(student, course), false);
});
