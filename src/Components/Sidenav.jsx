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
  faTachometerAlt,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import "./Sidenav.css";

export default function SideNav() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("jb_user")) || null; }
    catch { return null; }
  });

  const [auth, setAuth] = useState(() => {
    try { return JSON.parse(localStorage.getItem("jb_auth")) || null; }
    catch { return null; }
  });

  const isAdmin = auth?.role === "admin";

  // ─── Sync user state on any auth change ────────────────────
  useEffect(() => {
    function syncAuth() {
      try {
        setUser(JSON.parse(localStorage.getItem("jb_user")) || null);
        setAuth(JSON.parse(localStorage.getItem("jb_auth")) || null);
      } catch {
        setUser(null);
        setAuth(null);
      }
    }
    window.addEventListener("storage", syncAuth);
    window.addEventListener("jb_auth_change", syncAuth);
    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("jb_auth_change", syncAuth);
    };
  }, []);

  // ─── Responsive: auto-collapse on small screens ─────────────
  useEffect(() => {
    function checkMobile() {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true);
        setMobileMenuOpen(false);
      }
    }
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ─── Update layout offset when sidebar width changes ───────
  useEffect(() => {
    const width = isMobile ? "0px" : collapsed ? "80px" : "260px";
    // Update the CSS variable (used by app-main padding-left)
    document.documentElement.style.setProperty("--snav-width", width);
    // Also set it directly on app-main for instant effect
    const appMain = document.querySelector(".app-main");
    if (appMain) {
      appMain.style.paddingLeft = width;
    }
  }, [collapsed, isMobile]);

  // ─── Navigation items (role-aware) ──────────────────────────
  const publicItems = [
    { id: "home",      label: "Home",      icon: faHome,      to: "/" },
    { id: "companies", label: "Browse Jobs", icon: faBuilding, to: "/companies" },
  ];

  const seekerItems = [
    { id: "job-dashboard",  label: "My Dashboard",         icon: faTachometerAlt, to: "/job-dashboard" },
    { id: "profile",        label: "Profile",              icon: faUser,          to: "/profile" },
    { id: "applications",   label: "Application Status",   icon: faEnvelope,      to: "/applications" },
  ];

  const adminItems = [
    { id: "admin",   label: "Admin Dashboard", icon: faShieldAlt, to: "/admin" },
    { id: "profile", label: "Profile",         icon: faUser,      to: "/profile" },
    { id: "post",    label: "Post a Job",       icon: faPen,       to: "/post" },
  ];

  const authItems = isAdmin ? adminItems : seekerItems;

  function toggleSidebar() {
    if (isMobile) setMobileMenuOpen(o => !o);
    else setCollapsed(c => !c);
  }

  function handleNavClick() {
    if (isMobile) setMobileMenuOpen(false);
  }

  function signOut() {
    ["jb_user", "jb_auth", "jb_token"].forEach(k => localStorage.removeItem(k));
    setUser(null);
    setAuth(null);
    window.dispatchEvent(new Event("jb_auth_change"));
    navigate("/signin");
  }

  const sideNavClass = [
    "snav",
    collapsed ? "collapsed" : "",
    isMobile  ? "mobile"   : "",
    mobileMenuOpen ? "mobile-open" : "",
  ].filter(Boolean).join(" ");

  return (
    <>
      {/* Mobile hamburger */}
      {isMobile && (
        <button className="mobile-menu-btn" onClick={toggleSidebar} aria-label="Open menu">
          <FontAwesomeIcon icon={faBars} />
        </button>
      )}

      {/* Mobile dark overlay */}
      {isMobile && mobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      <aside className={sideNavClass} aria-label="Sidebar navigation">

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

        {/* Desktop collapse toggle */}
        {!isMobile && (
          <button className="snav-toggle" onClick={toggleSidebar} title="Toggle sidebar">
            <FontAwesomeIcon icon={collapsed ? faAngleDoubleRight : faAngleDoubleLeft} />
          </button>
        )}

        {/* Nav links */}
        <nav className="nav-list" aria-label="Main navigation">

          {/* Always-visible public items */}
          {publicItems.map(item => (
            <NavLink
              key={item.id}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
              onClick={handleNavClick}
            >
              <div className="ico"><FontAwesomeIcon icon={item.icon} /></div>
              {!collapsed && <div className="nav-label">{item.label}</div>}
            </NavLink>
          ))}

          {/* Divider when logged in */}
          {user && !collapsed && (
            <div className="nav-divider">
              <span>{isAdmin ? "Employer" : "My Account"}</span>
            </div>
          )}
          {user && collapsed && <div className="nav-divider-dot" />}

          {/* Role-based items */}
          {user && authItems.map(item => (
            <NavLink
              key={item.id}
              to={item.to}
              className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
              onClick={handleNavClick}
            >
              <div className="ico"><FontAwesomeIcon icon={item.icon} /></div>
              {!collapsed && <div className="nav-label">{item.label}</div>}
            </NavLink>
          ))}

          {/* Auth links when not logged in */}
          {!user && (
            <>
              <NavLink
                to="/signin"
                className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
                onClick={handleNavClick}
              >
                <div className="ico"><FontAwesomeIcon icon={faKey} /></div>
                {!collapsed && <div className="nav-label">Sign In</div>}
              </NavLink>
              <NavLink
                to="/signup"
                className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
                onClick={handleNavClick}
              >
                <div className="ico"><FontAwesomeIcon icon={faUserPlus} /></div>
                {!collapsed && <div className="nav-label">Sign Up</div>}
              </NavLink>
            </>
          )}
        </nav>

        <div className="spacer" />

        {/* User pill + logout */}
        {user && (
          <div className="bottom-actions">
            {/* User info */}
            <div className="user-pill">
              <div className="user-avatar">
                {(user.name || user.email || "U").charAt(0).toUpperCase()}
              </div>
              {!collapsed && (
                <div className="user-text">
                  <strong>{user.name || "User"}</strong>
                  <small>{user.email}</small>
                </div>
              )}
            </div>

            {/* Logout */}
            <div className="logout" onClick={signOut} role="button" tabIndex={0}
              onKeyDown={e => e.key === "Enter" && signOut()}>
              <div className="logout-ico">
                <FontAwesomeIcon icon={faSignOutAlt} />
              </div>
              {!collapsed && <div>Logout</div>}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
