# College Lab Equipment Management System (React + Express + Node.js + MySQL)

A full-stack, college-level Laboratory Inventory and Equipment Tracking Web Application built with **React**, **Express.js**, **Node.js**, **MySQL**, and **Chart.js**.

---

## 🏗️ Technology Stack
- **Frontend:** React 18, React Router v6, Chart.js, Font Awesome 6, Vite
- **Backend:** Node.js + Express.js REST API
- **Database:** MySQL Server (`college_lab_db`)
- **Database Driver:** `mysql2/promise` with ACID Transactions (pool connection)
- **Security:** JSON Web Tokens (JWT), `bcryptjs` password hashing, parameterized SQL queries

---

## 📁 Clean Project Architecture
```text
studentsproj/
│
├── client/                    # Frontend Web App (React 18 + Vite)
│   ├── src/
│   │   ├── components/        # Layout, Sidebar, Navbar, StatCard, RequestModal, ReturnModal
│   │   ├── context/           # AuthContext (JWT & Role session state)
│   │   ├── pages/             # LandingPage, Login, AdminDashboard, StudentDashboard,
│   │   │                      # FacultyDashboard, Equipment, AddEquipment, EditEquipment,
│   │   │                      # Users, Requests, IssueReturn, MyRequests
│   │   ├── services/api.js    # Centralized API Fetch Client with Bearer Token
│   │   ├── App.jsx            # Routing, Public Landing & Role Protection
│   │   ├── main.jsx           # React Entrypoint
│   │   └── index.css          # White, Light-Blue & Navy Slate Design System
│   ├── index.html             # HTML Shell with Font Awesome CDN
│   ├── vite.config.js         # Vite Configuration & Backend Proxy
│   └── package.json           # Frontend Dependencies
│
├── server/                    # Backend API (Node.js + Express)
│   ├── config/
│   │   └── db.js              # MySQL2 Connection Pool & Transaction Engine
│   ├── middleware/
│   │   └── auth.js            # JWT Verification & Role-based Guards
│   ├── routes/
│   │   ├── auth.js            # Login & User Profile Endpoints
│   │   ├── dashboard.js       # Admin, Faculty & Student Dashboard Metrics
│   │   ├── equipment.js       # Equipment CRUD, Search, Filter & Quick Status
│   │   ├── users.js           # User Account Management (Admin)
│   │   ├── requests.js        # Requisitions Submission & Approval Workflow
│   │   └── issuereturn.js     # Issue & Return Desk with Transaction Integrity
│   ├── .env.example           # Example environment configuration
│   ├── server.js              # Express Entrypoint & Static SPA Serving
│   └── package.json           # Backend Dependencies
│
├── package.json               # Root Automation Scripts (npm start, npm run server, etc.)
├── start.bat                  # 1-Click Windows Launcher
└── README.md                  # Complete Project Documentation
```

---

MySQL setup scripts and database seed data are not included in this repository.
Configure a `college_lab_db` database separately before starting the server.

## 🔑 Login Credentials for College Demonstration

| Role | Email Address | Password | Features Accessible |
|---|---|---|---|
| **Admin** | `admin@college.edu` | `admin123` | Full Equipment CRUD, User Management, Approvals/Rejections, Issue/Return Desk, Damaged Item Tracking, Analytics & Charts |
| **Faculty** | `prof.sharma@college.edu` | `faculty123` | Department Requisitions, Stock Catalog, Allocation History |
| **Student** | `rahul.kumar@college.edu` | `student123` | Equipment Catalog, Request Equipment, View Due Dates & Return Records |

> 💡 **Demo Shortcut:** On the login screen, click the **Admin**, **Faculty**, or **Student** button under **Quick Demo Autofill** to instantly log in without typing!

---

## 🚀 How to Run the Project

### Option A: 1-Click Launcher (Windows)
Double-click [`start.bat`](./start.bat) in the project folder.

---

### Option B: Terminal Command
Before starting the application, create `server/.env` from the example and set
your local MySQL credentials and a private JWT secret:
```powershell
Copy-Item server\.env.example server\.env
```

From the root directory (`studentsproj`), run:
```bash
npm start
```

Then open your browser and navigate to:
👉 **`http://localhost:5000`**

*(Express automatically serves both the React application and the API from port 5000 connected to MySQL!)*

---

### Option C: Development Mode (Hot-Reloading)
If you want to edit React code live:

**Terminal 1 (Backend Express API on port 5000):**
```bash
npm run server
```

**Terminal 2 (Frontend React Vite on port 3000):**
```bash
npm run client
```
Open your browser at: **`http://localhost:3000`**
