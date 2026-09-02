// src/Pages/SignIn.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiLogin } from "../api";
import "./SignIn.css";

export default function SignIn() {
  const [role, setRole] = useState("jobseeker"); // "jobseeker" | "admin"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    if (role === "admin") {
      if (!adminCode.trim()) {
        setErrorMsg("Please enter the admin secret code.");
        return;
      }
      if (adminCode.trim() !== "ADMIN123") {
        setErrorMsg("Invalid admin code (Demo code: ADMIN123)");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await apiLogin({ email, password });

      if (!res || !res.token) {
        setErrorMsg(res?.message || "Authentication failed.");
        setLoading(false);
        return;
      }

      const backendRole = res.user.role;

      if (backendRole !== role) {
        setErrorMsg(`Account registered as "${backendRole}". Please switch to the ${backendRole} tab.`);
        setLoading(false);
        return;
      }

      localStorage.setItem("jb_token", res.token);

      const sessionUser = {
        name: res.user.name,
        email: res.user.email,
        id: res.user.id,
      };
      const auth = {
        role: backendRole,
        email: res.user.email,
        provider: "email",
      };

      localStorage.setItem("jb_user", JSON.stringify(sessionUser));
      localStorage.setItem("jb_auth", JSON.stringify(auth));
      window.dispatchEvent(new Event("jb_auth_change"));

      if (backendRole === "admin") {
        navigate("/admin");
      } else {
        navigate("/job-dashboard");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to sign in. Please verify credentials.");
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

          <h1>Welcome Back</h1>
          <p>Sign in to access personalized remote developer recommendations, saved applications, and career insights.</p>

          <div className="auth-perks-list">
            <div className="perk-item">
              <span className="perk-icon">⚡</span>
              <div>
                <strong>1-Click Instant Application</strong>
                <p>Apply to top verified remote tech roles instantly.</p>
              </div>
            </div>

            <div className="perk-item">
              <span className="perk-icon">🔒</span>
              <div>
                <strong>Encrypted Workspace</strong>
                <p>Private applicant dashboard with real-time status updates.</p>
              </div>
            </div>

            <div className="perk-item">
              <span className="perk-icon">🎯</span>
              <div>
                <strong>AI Skill Match</strong>
                <p>Get personalized job matches tailored to your tech stack.</p>
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
              className={role === "jobseeker" ? "active" : ""}
              onClick={() => { setRole("jobseeker"); setErrorMsg(""); }}
            >
              💼 Job Seeker
            </button>
            <button
              type="button"
              className={role === "admin" ? "active" : ""}
              onClick={() => { setRole("admin"); setErrorMsg(""); }}
            >
              🛡️ Admin / Employer
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>{role === "jobseeker" ? "Job Seeker Login" : "Admin Console Access"}</h2>
            <p className="auth-subtext">Enter your login credentials to continue</p>

            {errorMsg && <div className="auth-error-banner">⚠️ {errorMsg}</div>}

            <div className="input-field">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {role === "admin" && (
              <div className="input-field">
                <div className="field-label-row">
                  <label>Admin Secret Code</label>
                  <span className="demo-hint-pill">Demo Code: ADMIN123</span>
                </div>
                <input
                  type="password"
                  placeholder="Enter ADMIN123"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  required
                />
              </div>
            )}

            <button type="submit" className="btn-auth-submit" disabled={loading}>
              {loading ? "Signing in..." : role === "jobseeker" ? "Sign In to Workspace ➔" : "Access Admin Panel ➔"}
            </button>

            <div className="auth-footer-prompt">
              <span>Don't have an account?</span>
              <Link to="/signup" className="auth-link">Create Account</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

