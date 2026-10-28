# Member 3 — Authentication and API Security Layer

This module provides end-to-end security, password protection, JWT token lifecycle management, and role-based access control for **EduStream LMS**.

---

## 🛡️ Deliverables & Features

### 1. Password Security (`bcryptjs`)
- **Mongoose Pre-Save Hook**: Automatically salts and hashes user passwords before saving (`bcrypt.hash(password, 12)`).
- **Password Comparison**: Schema instance method `user.comparePassword(candidatePassword)` securely verifies passwords against stored hashes.
- **Sensitive Data Scrubbing**: Schema `toJSON` transform automatically deletes `password` and `passwordHash` before any JSON response is returned, preventing credential leakage.

### 2. JWT Generation & Verification (`jsonwebtoken`)
- **Token Signing**: Issues signed HS256 tokens with `{ sub, email, role }` payloads expiring in 7 days (or configurable `JWT_EXPIRES_IN`).
- **Token Verification**: Validates bearer tokens against `JWT_SECRET` (enforcing $\ge 32$ characters).

### 3. Security Middleware (`server/middleware/authMiddleware.js`)
- **`authenticate` / `authenticateToken`**: Extracts and validates the `Authorization: Bearer <token>` header. Sets `req.user` with decoded claims or rejects with **401 Unauthorized**.
- **`authorize(...roles)` / `requireRole(...roles)`**: Restricts access to allowed roles (e.g., `instructor`). Rejects unauthorized roles with **403 Forbidden**.
- **`checkCourseOwnership` / `assertCourseOwnership`**: Ensures instructors can only edit, publish, or delete courses they created (`course.instructorId === req.user.sub`). Rejects non-owners with **403 Forbidden**.

### 4. Authentication Endpoints (`server/routes/authRoutes.js`)
- `POST /auth/register` — Validates input, checks duplicate email, hashes password, logs audit activity, and issues JWT + user info (201).
- `POST /auth/login` — Verifies email/password via bcrypt, returns JWT + sanitized user info (200).
- `GET /auth/me` — Returns authenticated user profile (protected).
- *Backward compatibility*: `POST /users` and `POST /users/login` also route through the secure auth controller.

### 5. Frontend & API Integration
- `src/api/api.js`: Automatically attaches `Authorization: Bearer <token>` from `sessionStorage.getItem("accessToken")` to all HTTP requests.
- `src/services/auth.js`: Handles login/registration directly against the backend authentication API, saving session data without breaking any existing React components.

---

## 🧪 Testing

### 1. Unit Tests
```bash
npm run test:security
```
Runs 7 targeted security tests verifying password hashing, token validation, user sanitization, middleware guards, and ownership logic.

### 2. End-to-End Test Suite
```bash
npm test
```
Executes a 10-step full verification test verifying 401 rejections, 403 role guards, duplicate checks, course creation, publishing, ownership isolation, and deletion.

### 3. Postman Collection
Import `postman/EduStream_API.postman_collection.json` into Postman to run interactive requests with pre-configured assertions and automated token capture.
