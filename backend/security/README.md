# Authentication integration contract

This directory is intentionally independent of the Express app and Mongoose
model. Member 1 can mount the controller methods on routes, while Member 2's
`User` model is injected into `createAuthController`.

## Required user fields

The Mongoose user schema should expose:

- `name`
- `email` (lowercase, trimmed, unique)
- `role` (`student` or `instructor`)
- `passwordHash` (select false is recommended)

The model must provide `findOne({ email }).lean()` and `create(data)`.

## Route wiring

```js
const authController = createAuthController({ User, jwtSecret: process.env.JWT_SECRET });
router.post("/register", authController.register);
router.post("/login", authController.login);
router.use(authenticateToken);
```

Use `requireRole("instructor")` for instructor-only routes. Before course
mutation, use `assertCourseOwnership(req.user, course)` and return `403` when
it is false. Never accept `role`, `instructorId`, or ownership from an
untrusted client after authentication.

Set `JWT_SECRET` to a random value of at least 32 characters. Do not commit it
to the repository or use a development fallback.
