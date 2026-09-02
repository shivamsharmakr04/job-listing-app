# 🚀 JobPortal — Modern Tech Career & Hiring Platform

A full-stack, glassmorphic **Job Board & Hiring Platform** built with **React 19**, **Vite**, **Node.js**, **Express**, and **MongoDB**. Designed for seamless job discovery, interactive application tracking, and an intuitive multi-step job posting experience for employers.

---

## ✨ Features

### 👨‍💻 For Job Seekers
- **Role Search & Discovery**: Browse, filter, and search job listings by domain, work mode (Remote, Hybrid, On-site), employment type, and compensation.
- **Interactive Candidate Dashboard**: Track submitted applications, application statuses, and saved job postings.
- **Profile & Resume Management**: Update candidate profiles and upload resumes cleanly.

### 🏢 For Employers & Admins
- **Redesigned Multi-Step Job Posting (`/post`)**:
  - **Guided 5-Step Sequence**: Job Basics → Work Structure → Compensation & Location → Role Description → Skills Tagging.
  - **Flexible Compensation Grid**: Multi-currency support (`₹ INR`, `$ USD`, `€ EUR`, `£ GBP`), salary range inputs, pay frequency (`LPA`, `/Year`, `/Month`), and live package preview badge.
  - **1-Click Skill Tags**: Rapid skill selection using quick-add popular skill pills (`React.js`, `Node.js`, `Python`, `AWS`, `Docker`, `Figma`, etc.).
  - **Sticky Assistant Sidebar**: Dynamic completion progress tracker (`0-100%`), live candidate card preview, pro employer tips, and quick draft/publish controls.
- **Admin Dashboard (`/admin`)**: Overview of active listings, application counts, and stored job postings.

### 🛡️ Authentication & Design
- **JWT & Role-Based Auth**: Secure authentication with `Admin` and `Candidate` user roles.
- **Glassmorphic Midnight Theme**: Modern dark-mode UI with smooth micro-animations, glassmorphism, responsive sidebar navigation, and mobile drawer support.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, React Router v7, FontAwesome Icons, Chart.js, Vanilla CSS Glassmorphism |
| **Backend** | Node.js, Express.js (v5), Mongoose (MongoDB ODM) |
| **Authentication** | JSON Web Tokens (JWT), Bcrypt.js |
| **File Storage** | Multer (Resumes & Uploads) |
| **Deployment** | Render / Vercel / Netlify compatible |

---

## 📁 Project Structure

```text
job-listing-app/
├── backend/
│   ├── middleware/        # JWT & file upload middlewares
│   ├── models/            # Mongoose schemas (User, Job, Application)
│   ├── routes/            # API routes (Auth, Jobs, Applications, Users)
│   ├── uploads/           # Uploaded static files (resumes, avatars)
│   ├── .env               # Environment configuration
│   └── server.js          # Express backend entry point
├── public/
│   ├── favicon.svg        # Modern SVG app logo badge
│   └── favicon.png
├── src/
│   ├── Components/        # Reusable UI components (SideNav, Footer, ProtectedRoute)
│   ├── Pages/             # Application routes (Home, Jobs, JobPost, JobDashboard, AdminDashboard, Profile, SignIn, SignUp)
│   ├── api.js             # API client calls
│   ├── App.jsx            # App shell & router configuration
│   └── main.jsx           # React root entry point
├── index.html             # HTML entry point with metadata & title
├── package.json           # Scripts & project dependencies
└── vite.config.js         # Vite configuration
```

---

## ⚡ Quick Start & Installation

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **MongoDB**: Local MongoDB instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster URL

### 2. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/himanshu9771/job-listing-app.git
cd job-listing-app

# Install dependencies
npm install
```

### 3. Environment Setup

Create or update `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/jobportal?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=http://localhost:5173
```

---

## 🚀 Running the Application

### Development Mode

Run the backend server and frontend Vite dev server concurrently:

```bash
# Terminal 1: Start Express Backend API (Runs on http://localhost:5000)
npm start

# Terminal 2: Start Vite Frontend (Runs on http://localhost:5173)
npm run dev
```

### Production Build

```bash
# Build Vite production assets
npm run build

# Start production server
npm start
```

---

## 📡 API Endpoints Summary

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/signup` — Register new user account
- `POST /api/auth/login` — Login user & return JWT token

### 💼 Jobs (`/api/jobs`)
- `GET /api/jobs` — Retrieve all active job listings (with domain/search filters)
- `GET /api/jobs/:id` — Get single job detail
- `POST /api/jobs` — Create new job listing (Admin only)
- `DELETE /api/jobs/:id` — Delete job listing (Admin only)

### 📄 Applications (`/api`)
- `POST /api/applications` — Submit candidate job application
- `GET /api/applications` — Get candidate applications / employer received applications

---

## 🎨 License

Distributed under the **ISC License**. Created with ❤️ for modern tech hiring.
