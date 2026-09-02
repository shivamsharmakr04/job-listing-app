// src/Pages/SignUp.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiSignup, apiLogin } from "../api";
import "./SignUp.css";

export default function SignUp() {
  const navigate = useNavigate();

  const [userType, setUserType] = useState("jobseeker"); // "jobseeker" | "admin"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim() || !email.trim() || !password.trim() || !confirm.trim()) {
      setErrorMsg("Please fill all required fields.");
      return;
    }
    if (password !== confirm) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const signupRes = await apiSignup({
        name,
        email,
        password,
        role: userType,
      });

      if (!signupRes || signupRes.error || signupRes.message === "Signup failed") {
        setErrorMsg(signupRes?.error || signupRes?.message || "Registration failed.");
        setLoading(false);
        return;
      }

      // Auto login after successful signup
      const loginRes = await apiLogin({ email, password });

      if (!loginRes || !loginRes.token) {
        setErrorMsg("Registration successful! Please sign in with your new credentials.");
        setTimeout(() => navigate("/signin"), 2000);
        return;
      }

      localStorage.setItem("jb_token", loginRes.token);
      localStorage.setItem(
        "jb_auth",
        JSON.stringify({
          role: loginRes.user.role,
          email: loginRes.user.email,
        })
      );
      localStorage.setItem(
        "jb_user",
        JSON.stringify({
          name: loginRes.user.name,
          email: loginRes.user.email,
          id: loginRes.user.id,
        })
      );
      window.dispatchEvent(new Event("jb_auth_change"));

      if (loginRes.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/job-dashboard");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred during signup.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-glass-card">
        {/* LEFT: Branding Panel */}
        <div className="auth-left-panel">
          <div className="auth-brand-badge">
            <div className="logo-box">JP</div>
            <span>JobPortal</span>
          </div>

          <h1>Create Account</h1>
          <p>Join thousands of tech professionals applying to top global engineering roles.</p>

          <div className="auth-perks-list">
            <div className="perk-item">
              <span className="perk-icon">🚀</span>
              <div>
                <strong>Curated Remote Roles</strong>
                <p>Access high-paying engineering & product design positions.</p>
              </div>
            </div>

            <div className="perk-item">
              <span className="perk-icon">📊</span>
              <div>
                <strong>Real-Time Application Tracker</strong>
                <p>Know exactly when employers review your resume.</p>
              </div>
            </div>

            <div className="perk-item">
              <span className="perk-icon">🛡️</span>
              <div>
                <strong>Verified Employers Only</strong>
                <p>Zero spam, direct connections with tech hiring teams.</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Form Panel */}
        <div className="auth-right-panel">
          {/* Segmented Role Switcher */}
          <div className="auth-role-toggle">
            <button
              type="button"
              className={userType === "jobseeker" ? "active" : ""}
              onClick={() => { setUserType("jobseeker"); setErrorMsg(""); }}
            >
              💼 Job Seeker
            </button>
            <button
              type="button"
              className={userType === "admin" ? "active" : ""}
              onClick={() => { setUserType("admin"); setErrorMsg(""); }}
            >
              🛡️ Admin / Employer
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>{userType === "jobseeker" ? "Register as Job Seeker" : "Register Admin Account"}</h2>
            <p className="auth-subtext">Fill in your information to get started</p>

            {errorMsg && <div className="auth-error-banner">⚠️ {errorMsg}</div>}

            <div className="input-field">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Alex Rivers"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="input-field">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="alex@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="input-field">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-auth-submit" disabled={loading}>
              {loading ? "Creating Account..." : userType === "jobseeker" ? "Create Job Seeker Account ➔" : "Create Admin Account ➔"}
            </button>

            <div className="auth-footer-prompt">
              <span>Already have an account?</span>
              <Link to="/signin" className="auth-link">Sign In</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

