// src/Pages/SignIn.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiLogin } from "../api";
import "./SignIn.css";

export default function SignIn() {
  const [role, setRole] = useState("jobseeker"); // "jobseeker" | "admin"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Please fill all required fields.");
      return;
    }

    // extra frontend check for admin (secret code)
    if (role === "admin") {
      if (!adminCode.trim()) {
        alert("Please enter admin secret code.");
        return;
      }
      if (adminCode.trim() !== "ADMIN123") {
        alert("Invalid admin secret code (demo: use ADMIN123)");
        return;
      }
    }

    try {
      // call backend login (backend knows the true role)
      const res = await apiLogin({ email, password });

      if (!res || !res.token) {
        alert(res?.message || "Login failed.");
        return;
      }

      const backendRole = res.user.role; // "jobseeker" | "admin"

      // optional safety: check that user selected the correct role
      if (backendRole !== role) {
        alert(
          `This account is registered as "${backendRole}". Please select the correct role to sign in.`
        );
        return;
      }

      // Save token + session data
      localStorage.setItem("jb_token", res.token);

      const sessionUser = {
        name: res.user.name,
        email: res.user.email,
      };
      const auth = {
        role: backendRole, // "jobseeker" | "admin"
        email: res.user.email,
        provider: "email",
      };

      localStorage.setItem("jb_user", JSON.stringify(sessionUser));
      localStorage.setItem("jb_auth", JSON.stringify(auth));

      // Redirect according to backend role
      if (backendRole === "admin") {
        navigate("/admin"); // Employer/Admin dashboard
      } else {
        navigate("/job-dashboard"); // Job seeker dashboard
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong while signing in.");
    }
  }

  const submitLabel =
    role === "jobseeker" ? "Sign in as Job Seeker" : "Sign in as Admin";

  return (
    <div className="signin-page">
      <div className="signin-card">
        {/* LEFT: branding / info */}
        <div className="signin-left">
          <h1>Sign in to JobPortal</h1>
          <p>
            Use your account to access your <strong>Job Seeker</strong>{" "}
            workspace or <strong>Admin</strong> console.
          </p>
          <ul>
            <li>Employees (job seekers) can search &amp; apply quickly</li>
            <li>Admins can create and manage job postings</li>
            <li>Track application status in one place</li>
          </ul>
        </div>

        {/* RIGHT: form */}
        <div className="signin-right">
          <div className="role-toggle">
            <button
              type="button"
              className={role === "jobseeker" ? "active" : ""}
              onClick={() => setRole("jobseeker")}
            >
              Job Seeker
            </button>
            <button
              type="button"
              className={role === "admin" ? "active" : ""}
              onClick={() => setRole("admin")}
            >
              Admin
            </button>
          </div>

          <form className="signin-form" onSubmit={handleSubmit}>
            <h2>
              {role === "jobseeker" ? "Job Seeker Sign in" : "Admin Sign in"}
            </h2>

            <div className="field">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {role === "admin" && (
              <div className="field">
                <label>Admin Secret Code</label>
                <input
                  type="password"
                  placeholder="Enter admin code (demo: ADMIN123)"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  required
                />
              </div>
            )}

            <button type="submit" className="btn-primary-large signin-btn">
              {submitLabel}
            </button>

            <p className="signin-hint">
              Don't have an account? Contact your administrator to create one.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
