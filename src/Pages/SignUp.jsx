// src/Pages/SignUp.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiSignup, apiLogin } from "../api"; // ✅
import "./SignUp.css";

export default function SignUp() {
  const navigate = useNavigate();

  const [userType, setUserType] = useState("jobseeker"); // "jobseeker" | "admin"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  async function register(provider = "email") {
    if (!name.trim() || !email.trim() || !password.trim() || !confirm.trim()) {
      alert("Please fill all fields.");
      return;
    }
    if (password !== confirm) {
      alert("Passwords do not match.");
      return;
    }

    try {
      // Backend role is same as UI selection: "jobseeker" or "admin"
      const signupRes = await apiSignup({
        name,
        email,
        password,
        role: userType,
      });

      if (!signupRes || signupRes.error || signupRes.message === "Signup failed") {
        alert("Signup failed: " + (signupRes?.error || signupRes?.message || ""));
        return;
      }

      // Auto login after signup
      const loginRes = await apiLogin({ email, password });

      if (!loginRes || !loginRes.token) {
        alert(loginRes?.message || "Auto login failed");
        return;
      }

      // Save token + user info in localStorage
      localStorage.setItem("jb_token", loginRes.token);
      localStorage.setItem(
        "jb_auth",
        JSON.stringify({
          role: loginRes.user.role, // "jobseeker" or "admin"
          email: loginRes.user.email,
        })
      );
      localStorage.setItem(
        "jb_user",
        JSON.stringify({
          name: loginRes.user.name,
          email: loginRes.user.email,
        })
      );

      alert("Account created successfully!");

      // Redirect according to role
      if (loginRes.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/job-dashboard");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong during signup.");
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    register("email"); // email-based signup
  }

  const headingText =
    userType === "jobseeker"
      ? "Create your job seeker account"
      : "Create your admin account";

  const buttonText =
    userType === "jobseeker"
      ? "Create job seeker account"
      : "Create admin account";

  return (
    <div className="signup-page">
      <div className="signup-card">
        {/* LEFT: intro text */}
        <div className="signup-left">
          <h1>Join JobPortal</h1>
          <p>
            Register as a <strong>Job Seeker</strong> (employee) to search and
            apply, or as an <strong>Admin</strong> to post and manage jobs.
          </p>
          <ul>
            <li>Employees: apply to jobs with one click</li>
            <li>Admins: create and manage job listings</li>
            <li>Track application status in real-time</li>
          </ul>
        </div>

        {/* RIGHT: user type + social + email form */}
        <div className="signup-right">
          <div className="signup-header-row">
            <h2>{headingText}</h2>

            <div className="user-type-toggle">
              <button
                type="button"
                className={userType === "jobseeker" ? "active" : ""}
                onClick={() => setUserType("jobseeker")}
              >
                Job Seeker
              </button>
              <button
                type="button"
                className={userType === "admin" ? "active" : ""}
                onClick={() => setUserType("admin")}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Social register with icons – still demo */}
          <div className="signup-social">
            <button
              type="button"
              className="social-btn google"
              onClick={() => register("Google")}
            >
              <span className="social-icon">G</span>
              <span>Continue with Google</span>
            </button>
            <button
              type="button"
              className="social-btn apple"
              onClick={() => register("Apple")}
            >
              <span className="social-icon"></span>
              <span>Continue with Apple</span>
            </button>
            <button
              type="button"
              className="social-btn linkedin"
              onClick={() => register("LinkedIn")}
            >
              <span className="social-icon">in</span>
              <span>Continue with LinkedIn</span>
            </button>
          </div>

          <div className="signup-divider">
            <span></span>
            <p>or sign up with email</p>
            <span></span>
          </div>

          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="field">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Password</label>
              <input
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Re-enter password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary-large signup-btn">
              {buttonText}
            </button>

            <p className="signup-note">
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
