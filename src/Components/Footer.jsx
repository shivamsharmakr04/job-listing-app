import React from "react";
import { NavLink } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-inner">
        {/* Brand / Short info */}
        <div className="footer-col footer-brand">
          <h2 className="footer-logo">JobPortal</h2>
          <p className="footer-tagline">
            Discover jobs, track applications, and grow your career with a clean,
            distraction-free experience.
          </p>

          <div className="footer-social-row">
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="footer-social-link linkedin"
            >
              <span className="footer-social-icon">in</span>
              <span>LinkedIn</span>
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              className="footer-social-link twitter"
            >
              <span className="footer-social-icon">X</span>
              <span>Twitter</span>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="footer-social-link instagram"
            >
              <span className="footer-social-icon">IG</span>
              <span>Instagram</span>
            </a>
          </div>
        </div>

        {/* Quick links – same as SideNav */}
        <div className="footer-col">
          <h3 className="footer-heading">Quick Links</h3>
          <nav className="footer-links">
            <NavLink to="/" className="footer-link">
              Home
            </NavLink>
            <NavLink to="/profile" className="footer-link">
              Profile
            </NavLink>
            <NavLink to="/companies" className="footer-link">
              Companies
            </NavLink>
            <NavLink to="/post" className="footer-link">
              Job Post
            </NavLink>
            <NavLink to="/applications" className="footer-link">
              Application Status
            </NavLink>
            <NavLink to="/signin" className="footer-link">
              Sign In
            </NavLink>
            <NavLink to="/signup" className="footer-link">
              Sign Up
            </NavLink>
          </nav>
        </div>

        {/* Extra info / contact */}
        <div className="footer-col">
          <h3 className="footer-heading">Support</h3>
          <p className="footer-text">
            Need help? Reach out to our support team or explore FAQs.
          </p>
          <ul className="footer-list">
            <li>Email: support@jobportal.com</li>
            <li>Help Center</li>
            <li>Privacy Policy</li>
            <li>Terms &amp; Conditions</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {currentYear} Jobportal. All rights reserved.</p>
        <p className="footer-bottom-right">
          Built for job seekers &amp; employers ⚡
        </p>
      </div>
    </footer>
  );
}
