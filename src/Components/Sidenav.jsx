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
  faTimes,
  faChevronLeft,
  faChevronRight,
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

  // Sync user state on any auth change
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

  // Responsive check on resize
  useEffect(() => {
    function checkMobile() {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(false); // Mobile uses full drawer mode when open
      }
    }
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Update layout offset variable on root
  useEffect(() => {
    const width = isMobile ? "0px" : collapsed ? "80px" : "260px";
    document.documentElement.style.setProperty("--snav-width", width);
    const appMain = document.querySelector(".app-main");
    if (appMain) {
      appMain.style.paddingLeft = width;
    }
  }, [collapsed, isMobile]);

  // Navigation items
  const publicItems = [
    { id: "home", label: "Home", icon: faHome, to: "/" },
    { id: "companies", label: "Browse Roles", icon: faBuilding, to: "/companies" },
  ];

  const seekerItems = [
    { id: "job-dashboard", label: "My Dashboard", icon: faTachometerAlt, to: "/job-dashboard" },
    { id: "profile", label: "Profile", icon: faUser, to: "/profile" },
    { id: "applications", label: "Applications", icon: faEnvelope, to: "/applications" },
  ];

  const adminItems = [
    { id: "admin", label: "Admin Portal", icon: faShieldAlt, to: "/admin" },
    { id: "profile", label: "Profile", icon: faUser, to: "/profile" },
    { id: "post", label: "Post a Job", icon: faPen, to: "/post" },
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
    if (isMobile) setMobileMenuOpen(false);
    navigate("/signin");
  }

  const sideNavClass = [
    "snav",
    collapsed && !isMobile ? "collapsed" : "",
    isMobile ? "mobile" : "",
    isMobile && mobileMenuOpen ? "mobile-open" : "",
  ].filter(Boolean).join(" ");

  return (
    <>
      {/* Mobile Floating Toggle Button */}
      {isMobile && (
        <button
          className="mobile-menu-btn"
          onClick={toggleSidebar}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} />
        </button>
      )}

      {/* Mobile Glass Backdrop Overlay */}
      {isMobile && mobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      <aside className={sideNavClass} aria-label="Sidebar navigation">
        {/* Desktop Edge Floating Toggle Button */}
        {!isMobile && (
          <button
            className={`snav-edge-toggle ${collapsed ? "collapsed" : ""}`}
            onClick={toggleSidebar}
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <FontAwesomeIcon icon={collapsed ? faChevronRight : faChevronLeft} />
          </button>
        )}

        {/* Header / Brand */}
        <div className="snav-header">
          <NavLink to="/" className="brand" onClick={handleNavClick}>
            <div className="logo">
              <svg width="22" height="22" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M176 192V144C176 117.49 197.49 96 224 96H288C314.51 96 336 117.49 336 144V192H384C410.51 192 432 213.49 432 240V384C432 410.51 410.51 432 384 432H128C101.49 432 80 410.51 80 384V240C80 213.49 101.49 192 128 192H176ZM224 144V192H288V144C288 135.16 280.84 128 272 128H240C231.16 128 224 135.16 224 144ZM128 240V384H384V240H128Z" fill="#ffffff" />
                <circle cx="256" cy="300" r="28" fill="#38bdf8" />
              </svg>
            </div>
            {(!collapsed || isMobile) && (
              <div className="brand-info">
                <div className="title">JobPortal</div>
                <div className="subtitle">Modern Tech Jobs</div>
              </div>
            )}
          </NavLink>

          {/* Mobile close button inside drawer */}
          {isMobile && (
            <button className="mobile-close-drawer" onClick={() => setMobileMenuOpen(false)}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav className="nav-list" aria-label="Main navigation">
          {publicItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
              onClick={handleNavClick}
            >
              <div className="ico"><FontAwesomeIcon icon={item.icon} /></div>
              {(!collapsed || isMobile) && <div className="nav-label">{item.label}</div>}
            </NavLink>
          ))}

          {/* Section Divider when authenticated */}
          {user && (!collapsed || isMobile) && (
            <div className="nav-divider">
              <span>{isAdmin ? "Admin Controls" : "User Workspace"}</span>
            </div>
          )}
          {user && collapsed && !isMobile && <div className="nav-divider-dot" />}

          {/* Role-specific menu items */}
          {user && authItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.to}
              className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
              onClick={handleNavClick}
            >
              <div className="ico"><FontAwesomeIcon icon={item.icon} /></div>
              {(!collapsed || isMobile) && <div className="nav-label">{item.label}</div>}
            </NavLink>
          ))}

          {/* Guest authentication menu items */}
          {!user && (
            <>
              <NavLink
                to="/signin"
                className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
                onClick={handleNavClick}
              >
                <div className="ico"><FontAwesomeIcon icon={faKey} /></div>
                {(!collapsed || isMobile) && <div className="nav-label">Sign In</div>}
              </NavLink>
              <NavLink
                to="/signup"
                className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
                onClick={handleNavClick}
              >
                <div className="ico"><FontAwesomeIcon icon={faUserPlus} /></div>
                {(!collapsed || isMobile) && <div className="nav-label">Sign Up</div>}
              </NavLink>
            </>
          )}
        </nav>

        <div className="spacer" />

        {/* User profile & logout footer */}
        {user && (
          <div className="bottom-actions">
            <div className="user-pill" onClick={() => { navigate("/profile"); handleNavClick(); }}>
              <div className="user-avatar">
                {(user.name || user.email || "U").charAt(0).toUpperCase()}
              </div>
              {(!collapsed || isMobile) && (
                <div className="user-text">
                  <strong>{user.name || "User"}</strong>
                  <small>{user.email}</small>
                </div>
              )}
            </div>

            <div
              className="logout-btn"
              onClick={signOut}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && signOut()}
              title="Sign Out"
            >
              <div className="logout-ico">
                <FontAwesomeIcon icon={faSignOutAlt} />
              </div>
              {(!collapsed || isMobile) && <div className="logout-label">Log Out</div>}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}


