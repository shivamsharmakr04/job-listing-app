import './App.css';
import SideNav from './Components/Sidenav';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './Components/ProtectedRoute';
import Home from './Pages/Home.jsx';
import Jobs from './Pages/Jobs.jsx';
import Profile from './Pages/Profile.jsx';
import PostJob from './Pages/JobPost.jsx';
import Applications from './Pages/Applications.jsx';
import SignIn from './Pages/SignIn.jsx';
import JobDashboard from './Pages/JobDashboard.jsx';
import SignUp from './Pages/SignUp.jsx';
import AdminDashboard from './Pages/AdminDashboard.jsx';
import Footer from './Components/Footer.jsx';

function App() {
  return (
    <div className="app-shell">
      <SideNav />

      <main className="app-main">
        {/* Routes live in their own wrapper that carries the page padding */}
        <div className="routes-wrapper">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/companies" element={<Jobs />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Protected: any logged-in user */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applications"
              element={
                <ProtectedRoute>
                  <Applications />
                </ProtectedRoute>
              }
            />

            {/* Protected: job seeker dashboard */}
            <Route
              path="/job-dashboard"
              element={
                <ProtectedRoute>
                  <JobDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected: admin only */}
            <Route
              path="/post"
              element={
                <ProtectedRoute role="admin">
                  <PostJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {/* Footer sits outside routes-wrapper so it has no inner page padding,
            spans the full width of app-main cleanly */}
        <Footer />
      </main>
    </div>
  );
}

export default App;
