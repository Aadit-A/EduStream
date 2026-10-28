# EduStream Backend — Member 2 Deliverable (MongoDB & Mongoose)

This directory contains the database layer and backend architecture developed for EduStream LMS using **MongoDB Atlas** and **Mongoose**.

---

## 🗂️ Structure & File Ownership

- **`config/db.js`**: MongoDB connection setup with Mongoose.
- **`models/User.js`**: User schema with email format regex, unique constraints, and role enum (`student`, `instructor`).
- **`models/Course.js`**: Course schema with `instructorId` reference (`ObjectId` pointing to `User`), status enum (`draft`, `published`), and timestamps.
- **`models/ActivityLog.js`**: Audit trail schema tracking actions (`COURSE_CREATED`, `COURSE_UPDATED`, `COURSE_PUBLISHED`, `COURSE_DELETED`) with dual references to `User` & `Course` and title snapshot.
- **`controllers/`**:
  - `userController.js`: User queries and registration with duplicate email validation.
  - `courseController.js`: Full CRUD with `.populate("instructorId", "name email")` and automatic audit logging.
  - `activityLogController.js`: Fetching audit history with `.populate()` on actor and course.
- **`routes/`**: Clean Express routing definitions (`/users`, `/courses`, `/activity-logs`).
- **`middleware/errorHandler.js`**: Centralized error middleware handling Mongoose `ValidationError`, `CastError`, and duplicate keys (code 11000).
- **`seed.js`**: Database seeding script with demo instructors, students, and courses.

---

## 🚀 Setup & Execution

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Ensure `.env` contains your MongoDB Atlas connection string:
```env
PORT=3001
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/edustream?retryWrites=true&w=majority
NODE_ENV=development
```

### 3. Seed Database
```bash
npm run seed
```

### 4. Start Server
```bash
npm run dev
# or
npm start
```
Server runs on `http://localhost:3001`.
