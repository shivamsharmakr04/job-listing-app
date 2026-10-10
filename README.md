# Job Listing Platform

A full-stack job portal built with React, Node.js, Express, and MongoDB. The application supports candidate authentication, job discovery, job posting, applications, profiles, dashboards, and resume uploads.

## ✨ Highlights

- 🔐 Candidate and admin authentication
- 🔎 Job search and filtering
- 💼 Job creation and management
- 📄 Candidate application workflow
- 📎 Resume and file uploads
- 👤 Candidate profiles
- 📊 Employer/admin dashboard
- 📱 Responsive modern UI
- 🛡️ JWT-based protected routes

## 🧰 Tech Stack

**Frontend:** React, Vite, React Router  
**Backend:** Node.js, Express.js  
**Database:** MongoDB, Mongoose  
**Authentication:** JWT, bcrypt  
**File Handling:** Multer  
**UI:** CSS, responsive layouts

## 🏗️ Architecture

```text
React Client
    │
    ▼
Express REST API
    │
 ┌──┼──────────────┐
 ▼  ▼              ▼
Auth Jobs       Applications
    │
    ▼
MongoDB
```

## 🚀 Getting Started

```bash
git clone https://github.com/shivamsharmakr04/job-listing-app.git
cd job-listing-app
npm install
```

Configure your backend environment variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

Start the application using the project's backend and frontend scripts.

## 📌 What This Project Demonstrates

- Full-stack CRUD development
- REST API design
- Authentication and authorization
- MongoDB data modeling
- File upload handling
- Job/application workflows
- Dashboard development

## 👨‍💻 Author

**Shivam Kumar** — Full-Stack Developer

[GitHub](https://github.com/shivamsharmakr04) · [LinkedIn](https://linkedin.com/in/shivam-kumar-b0aab2209)

---
