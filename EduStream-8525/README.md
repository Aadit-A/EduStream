# EduStream LMS (React Migration)

A modern, responsive Learning Management System migrated from vanilla HTML/JavaScript to **React 18** with **Vite** and **React Router 6**.

## 🚀 Key Features Preserved & Enhanced
- **Identical Logic & Async Handling**: All functions (`apiGet`, `apiPost`, `apiPatch`, `apiDelete`, `getUsers`, `registerUser`, `loginUser`, `getCurrentUser`, `isLoggedIn`, `logoutUser`, `requireLogin`, `requireRole`) remain 100% functionally identical.
- **Session Management**: Preserves `sessionStorage` key `"currentUser"` ensuring compatibility with existing authentication expectations.
- **Instructor Dashboard**: Full course management including draft creation, in-place course editing, publishing, course removal, and course table status view.
- **Student Portal**: Browse published courses with dynamic alphabetical sorting (A-Z, Z-A), course cards with category tags, descriptions, and accessible deep-dive course detail views.
- **Authentication**: Validation for email formats, password requirements, duplicate account checks, and automatic role-based post-login routing.
- **Modern UI & Aesthetics**: Built with high-contrast, polished styling, clean Inter typography, responsive card layouts, and subtle micro-interactions.

---

## 🛠️ Project Structure
```
├── db.json                     # JSON Server mock database (users & courses)
├── package.json                # Project dependencies and run scripts
├── vite.config.js              # Vite configuration with React plugin
├── index.html                  # Single-page application root entry
├── vanilla_backup/             # Complete backup of original vanilla HTML/JS/CSS files
├── src/
│   ├── api/
│   │   └── api.js              # Core fetch API client
│   ├── services/
│   │   └── auth.js             # Authentication logic & session helpers
│   ├── context/
│   │   └── AuthContext.jsx     # Reactive React auth state provider
│   ├── components/
│   │   ├── Navbar.jsx          # Dynamic navigation bar
│   │   └── ProtectedRoute.jsx  # Route protection & role guard
│   ├── pages/
│   │   ├── Home.jsx            # Authenticated user dashboard
│   │   ├── Login.jsx           # User login page
│   │   ├── Register.jsx        # User registration page
│   │   ├── Courses.jsx         # Published courses student catalog
│   │   ├── CourseDetails.jsx   # Individual course overview
│   │   └── Instructor.jsx      # Instructor course management panel
│   ├── styles/
│   │   └── index.css           # Unified design system & responsive styling
│   ├── App.jsx                 # Route definitions (supporting both '/' and '.html' paths)
│   ├── main.jsx                # React DOM mounting
│   └── e2e_api_test.mjs        # API & Auth flow validation suite
```

---

## 💻 Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Both Server & Frontend Concurrently (Recommended)
```bash
npm run dev:all
```
- Frontend: `http://localhost:5173`
- Backend API (`json-server`): `http://localhost:3001`

### 3. Run Separately
To run the mock API backend:
```bash
npm run server
```
To run the Vite React frontend:
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

### 5. Run Verification Tests
```bash
npm test
```
