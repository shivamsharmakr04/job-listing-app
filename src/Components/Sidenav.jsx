// src/Components/Sidenav.jsx
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUser,
  faBuilding,
  faPen,
  faEnvelope,
  faKey,
  faUserPlus,
  faSignOutAlt,
  faBars,
  faAngleDoubleLeft,
  faAngleDoubleRight,
} from "@fortawesome/free-solid-svg-icons";
import "./SideNav.css";

export default function SideNav() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("jb_user")) || null;
    } catch {
      return null;
    }
  });
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const items = [
    { id: "home", label: "Home", icon: faHome, to: "/" },
    { id: "profile", label: "Profile", icon: faUser, to: "/profile" },
    { id: "companies", label: "Companies", icon: faBuilding, to: "/companies" },
    { id: "post", label: "Job Post", icon: faPen, to: "/post" },
    {
      id: "applications",
      label: "Application Status",
      icon: faEnvelope,
      to: "/applications",
    },
  ];

  // Detect mobile and auto-collapse on small screens
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setCollapsed(true);
        setMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Sync user from localStorage
  useEffect(() => {
    function onStorage(e) {
      if (e.key === "jb_user") {
        try {
          setUser(JSON.parse(localStorage.getItem("jb_user")));
        } catch {
          setUser(null);
        }
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Notify pages when sidebar changes (collapsed/mobile)
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("sidebar-toggle", {
        detail: { collapsed, isMobile },
      })
    );
  }, [collapsed, isMobile]);

  // Also expose current width to CSS (for app-main / other pages)
  useEffect(() => {
    const width = isMobile ? "0px" : collapsed ? "80px" : "260px";
    document.documentElement.style.setProperty("--snav-width", width);
  }, [collapsed, isMobile]);

  function toggleSidebar() {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setCollapsed((c) => !c);
    }
  }

  function signOut() {
    localStorage.removeItem("jb_user");
    localStorage.removeItem("jb_auth");
    setUser(null);
    navigate("/signin");
  }

  function handleSignUp({ name, email, password }) {
    if (!name || !email || !password) return alert("All fields required");
    const users = JSON.parse(localStorage.getItem("jb_users") || "[]");
    if (users.find((u) => u.email === email)) return alert("Email already used");
    users.push({ name, email, password });
    localStorage.setItem("jb_users", JSON.stringify(users));
    const u = { name, email };
    localStorage.setItem("jb_user", JSON.stringify(u));
    setUser(u);
    setShowSignUp(false);
  }

  function handleSignIn({ email, password }) {
    const users = JSON.parse(localStorage.getItem("jb_users") || "[]");
    const u = users.find((x) => x.email === email && x.password === password);
    if (!u) return alert("Invalid credentials (demo)");
    const userObj = { name: u.name, email: u.email };
    localStorage.setItem("jb_user", JSON.stringify(userObj));
    setUser(userObj);
    setShowSignIn(false);
  }

  function handleNavClick() {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  }

  return (
    <>
      {/* Mobile hamburger button */}
      {isMobile && (
        <button className="mobile-menu-btn" onClick={toggleSidebar}>
          <FontAwesomeIcon icon={faBars} />
        </button>
      )}

      {/* Dark overlay on mobile when sidebar is open */}
      {isMobile && mobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      <aside
        className={`snav ${collapsed ? "collapsed" : ""} ${
          isMobile ? "mobile" : ""
        } ${mobileMenuOpen ? "mobile-open" : ""}`}
      >
        {/* Brand */}
        <NavLink to="/" className="brand" onClick={handleNavClick}>
          <div className="logo">JP</div>
          {!collapsed && (
            <div>
              <div className="title">JobPortal</div>
              <div className="subtitle">Find your next role</div>
            </div>
          )}
        </NavLink>

        {/* Toggle button (desktop only) */}
        {!isMobile && (
          <button
            className="snav-toggle"
            onClick={toggleSidebar}
            title="Toggle sidebar"
          >
            <FontAwesomeIcon
              icon={collapsed ? faAngleDoubleRight : faAngleDoubleLeft}
            />
          </button>
        )}

        {/* Navigation links */}
        <nav className="nav-list" aria-label="Main navigation">
          {items.map((it) => (
            <NavLink
              key={it.id}
              to={it.to}
              className={({ isActive }) =>
                "nav-item" + (isActive ? " active" : "")
              }
              onClick={handleNavClick}
            >
              <div className="ico">
                <FontAwesomeIcon icon={it.icon} />
              </div>
              {!collapsed && <div className="nav-label">{it.label}</div>}
            </NavLink>
          ))}

          {!user ? (
            <>
              <NavLink
                to="/signin"
                className={({ isActive }) =>
                  "nav-item" + (isActive ? " active" : "")
                }
                onClick={handleNavClick}
              >
                <div className="ico">
                  <FontAwesomeIcon icon={faKey} />
                </div>
                {!collapsed && <div className="nav-label">Sign in</div>}
              </NavLink>

              <NavLink
                to="/signup"
                className={({ isActive }) =>
                  "nav-item" + (isActive ? " active" : "")
                }
                onClick={handleNavClick}
              >
                <div className="ico">
                  <FontAwesomeIcon icon={faUserPlus} />
                </div>
                {!collapsed && <div className="nav-label">Sign up</div>}
              </NavLink>
            </>
          ) : (
            <div className="nav-item user-pill" title={user.email}>
              <div className="user-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              {!collapsed && (
                <div className="user-text">
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="spacer" />

        {/* Logout at bottom */}
        <div className="bottom-actions">
          <div className="logout" onClick={signOut}>
            <div className="logout-ico">
              <FontAwesomeIcon icon={faSignOutAlt} />
            </div>
            {!collapsed && <div>Logout</div>}
          </div>
        </div>
      </aside>
    </>
  );
}
