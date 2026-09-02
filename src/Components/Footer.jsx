import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const auth = (() => {
    try { return JSON.parse(localStorage.getItem("jb_auth")); }
    catch { return null; }
  })();
  const isAdmin = auth?.role === "admin";
  const isLoggedIn = !!auth;

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail("");
      }, 3500);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleQuickCategory = () => {
    navigate("/");
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  return (
    <footer className="app-footer">
      {/* Top Accent Gradient Border */}
      <div className="footer-top-glow" />

      <div className="footer-container">
        {/* Main 3-Column Content Grid */}
        <div className="footer-grid">
          {/* Column 1: Brand & Status */}
          <div className="footer-brand-col">
            <div className="footer-logo-row" onClick={scrollToTop}>
              <div className="footer-logo-box">JP</div>
              <div className="footer-brand-title">
                <h2>JobPortal</h2>
                <span className="footer-version">v2.0</span>
              </div>
            </div>
            <p className="footer-tagline">
              Empowering top tech talent to discover remote and high-growth engineering roles worldwide.
            </p>
            <div className="footer-status-pill">
              <span className="status-dot" /> 100% Systems Operational
            </div>
            <div className="footer-social-row">
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social-pill" title="LinkedIn">LinkedIn</a>
              <a href="https://x.com" target="_blank" rel="noreferrer" className="social-pill" title="Twitter">X / Twitter</a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="social-pill" title="GitHub">GitHub</a>
              <a href="https://discord.com" target="_blank" rel="noreferrer" className="social-pill" title="Discord">Discord</a>
            </div>
          </div>

          {/* Column 2: Navigation & Quick Tech Domains */}
          <div className="footer-links-col">
            <div className="footer-subcol">
              <h4>Navigation</h4>
              <ul className="footer-link-list">
                <li><NavLink to="/" onClick={scrollToTop}>Home</NavLink></li>
                <li><NavLink to="/companies" onClick={scrollToTop}>Browse Roles</NavLink></li>
                {isLoggedIn && <li><NavLink to="/profile" onClick={scrollToTop}>My Profile</NavLink></li>}
                {isLoggedIn && !isAdmin && <li><NavLink to="/job-dashboard" onClick={scrollToTop}>Dashboard</NavLink></li>}
                {isLoggedIn && !isAdmin && <li><NavLink to="/applications" onClick={scrollToTop}>Applications</NavLink></li>}
                {isAdmin && <li><NavLink to="/admin" onClick={scrollToTop}>Admin Panel</NavLink></li>}
                {isAdmin && <li><NavLink to="/post" onClick={scrollToTop}>Post a Job</NavLink></li>}
                {!isLoggedIn && <li><NavLink to="/signin" onClick={scrollToTop}>Sign In</NavLink></li>}
                {!isLoggedIn && <li><NavLink to="/signup" onClick={scrollToTop}>Sign Up</NavLink></li>}
              </ul>
            </div>

            <div className="footer-subcol">
              <h4>Popular Domains</h4>
              <ul className="footer-link-list">
                <li><button type="button" className="text-btn" onClick={handleQuickCategory}>Frontend Engineering</button></li>
                <li><button type="button" className="text-btn" onClick={handleQuickCategory}>Backend Architecture</button></li>
                <li><button type="button" className="text-btn" onClick={handleQuickCategory}>Full Stack & AI</button></li>
                <li><button type="button" className="text-btn" onClick={handleQuickCategory}>Data Science & ML</button></li>
                <li><button type="button" className="text-btn" onClick={handleQuickCategory}>Cloud & DevOps</button></li>
              </ul>
            </div>
          </div>

          {/* Column 3: Newsletter & Back-to-Top */}
          <div className="footer-newsletter-col">
            <h4>Stay Connected</h4>
            <p>Get curated weekly alerts for remote engineering & product design positions.</p>

            <form className="footer-news-form" onSubmit={handleSubscribe}>
              {subscribed ? (
                <div className="news-success-alert">
                  ✨ Subscribed! Check your inbox soon.
                </div>
              ) : (
                <div className="news-input-pill">
                  <input
                    type="email"
                    placeholder="Enter your work email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="news-submit-btn">
                    Join
                  </button>
                </div>
              )}
            </form>

            <div className="footer-back-top-wrap">
              <button type="button" className="btn-back-top" onClick={scrollToTop}>
                Back to Top ↑
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Rights & Badges */}
        <div className="footer-bottom-bar">
          <p>© {currentYear} <strong>JobPortal</strong> Inc. All rights reserved.</p>
          <div className="footer-bottom-links">
            <span className="footer-badge">🔒 End-to-End Secure</span>
            <span className="footer-badge">⚡ Instant Apply</span>
            <span className="footer-badge">🌐 Global Remote</span>
          </div>
        </div>
      </div>
    </footer>
  );
}