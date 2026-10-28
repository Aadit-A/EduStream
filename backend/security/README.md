# Authentication security contract

This module is independent of Express route and Mongoose model creation. Member
1 can mount the controller methods on `/auth/register` and `/auth/login`.
Member 2's `User` model is injected into `createAuthController`.

The model must expose `name`, lowercase unique `email`, `role`, and
`passwordHash`, and support `findOne({ email }).lean()` and `create(data)`.

```js
const auth = createAuthController({ User, jwtSecret: process.env.JWT_SECRET });
router.post("/register", auth.register);
router.post("/login", auth.login);
router.use(authenticateToken);
router.patch("/:id", requireRole("instructor"), updateCourse);
```

For course edits, publishing, and deletion, load the course and reject the
request with `403` unless `assertCourseOwnership(req.user, course)` is true.
Never trust a client-supplied role or instructor ID.

Set `JWT_SECRET` to a random value of at least 32 characters. Never commit it.
