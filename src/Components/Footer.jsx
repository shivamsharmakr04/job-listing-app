import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  const auth = (() => {
    try { return JSON.parse(localStorage.getItem("jb_auth")); }
    catch { return null; }
  })();
  const isAdmin = auth?.role === "admin";
  const isLoggedIn = !!auth;

  return (
    <footer className="app-footer">
      {/* Top gradient bar */}
      <div className="footer-gradient-bar" />

      <div className="footer-inner">

        {/* Brand Column */}
        <div className="footer-col footer-brand">
          <div className="footer-logo-wrap">
            <div className="footer-logo-icon">JP</div>
            <h2 className="footer-logo-text">JobPortal</h2>
          </div>
          <p className="footer-tagline">
            Discover jobs, track applications, and grow your career — all in one
            clean, distraction-free platform built for modern professionals.
          </p>
          <div className="footer-social-row">
            <a href="https://www.linkedin.com" target="_blank" rel="noreferrer"
               className="footer-social-link linkedin" aria-label="LinkedIn">
              <span className="footer-social-icon">in</span>
              <span>LinkedIn</span>
            </a>
            <a href="https://x.com" target="_blank" rel="noreferrer"
               className="footer-social-link twitter" aria-label="Twitter">
              <span className="footer-social-icon">𝕏</span>
              <span>Twitter</span>
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer"
               className="footer-social-link github" aria-label="GitHub">
              <span className="footer-social-icon">⌥</span>
              <span>GitHub</span>
            </a>
          </div>
        </div>

        {/* Navigation Column */}
        <div className="footer-col">
          <h3 className="footer-heading">Quick Links</h3>
          <nav className="footer-links" aria-label="Footer navigation">
            <NavLink to="/" className="footer-link">🏠 Home</NavLink>
            <NavLink to="/companies" className="footer-link">🏢 Browse Jobs</NavLink>
            {isLoggedIn && (
              <NavLink to="/profile" className="footer-link">👤 My Profile</NavLink>
            )}
            {isLoggedIn && !isAdmin && (
              <NavLink to="/job-dashboard" className="footer-link">📊 My Dashboard</NavLink>
            )}
            {isLoggedIn && !isAdmin && (
              <NavLink to="/applications" className="footer-link">📋 My Applications</NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin" className="footer-link">🛡️ Admin Dashboard</NavLink>
            )}
            {isAdmin && (
              <NavLink to="/post" className="footer-link">➕ Post a Job</NavLink>
            )}
            {!isLoggedIn && (
              <NavLink to="/signin" className="footer-link">🔑 Sign In</NavLink>
            )}
            {!isLoggedIn && (
              <NavLink to="/signup" className="footer-link">📝 Sign Up</NavLink>
            )}
          </nav>
        </div>

        {/* Support Column */}
        <div className="footer-col">
          <h3 className="footer-heading">Support</h3>
          <p className="footer-text">
            Have questions? Our support team is here to help you succeed on your
            job search journey.
          </p>
          <ul className="footer-list">
            <li>
              <a href="mailto:support@jobportal.com" className="footer-list-link">
                📧 support@jobportal.com
              </a>
            </li>
            <li><span className="footer-list-link">❓ Help Center</span></li>
            <li><span className="footer-list-link">🔒 Privacy Policy</span></li>
            <li><span className="footer-list-link">📄 Terms &amp; Conditions</span></li>
          </ul>

          {/* CTA */}
          {!isLoggedIn && (
            <button className="footer-cta-btn" onClick={() => navigate("/signup")}>
              Get Started Free →
            </button>
          )}
          {isLoggedIn && !isAdmin && (
            <button className="footer-cta-btn" onClick={() => navigate("/companies")}>
              Browse Open Roles →
            </button>
          )}
          {isAdmin && (
            <button className="footer-cta-btn" onClick={() => navigate("/post")}>
              Post a New Job →
            </button>
          )}
        </div>

      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <p>© {currentYear} <strong>JobPortal</strong>. All rights reserved.</p>
        <div className="footer-bottom-badges">
          <span className="footer-badge">⚡ Fast</span>
          <span className="footer-badge">🔒 Secure</span>
          <span className="footer-badge">🌐 Live</span>
        </div>
        <p className="footer-bottom-right">Built for job seekers &amp; employers</p>
      </div>
    </footer>
  );
}