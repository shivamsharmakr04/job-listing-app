// src/Pages/JobDashboard.jsx — Seeker Command Center Dashboard
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./JobDashboard.css";
import { apiMyApplications, apiGetJobs, apiApplyJob, apiWithdrawApplication } from "../api";

const DEMO_APPLICATIONS = [
  { id: "d1", jobTitle: "Senior Frontend Engineer", company: "Google", status: "Reviewing", appliedOn: "2025-01-10", jobId: "d1" },
  { id: "d2", jobTitle: "Backend Architect", company: "Amazon", status: "Accepted", appliedOn: "2025-01-08", jobId: "d2" },
  { id: "d3", jobTitle: "UI/UX Product Designer", company: "Microsoft", status: "Applied", appliedOn: "2025-01-12", jobId: "d3" },
  { id: "d4", jobTitle: "Full Stack AI Developer", company: "Netflix", status: "Accepted", appliedOn: "2024-12-20", jobId: "d4" },
];

export default function JobDashboard() {
  const navigate = useNavigate();
  const [user] = useState(() => {
    try {
      const u = localStorage.getItem("jb_user");
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  });

  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("jb_saved_jobs") || "[]"); }
    catch { return []; }
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [toastMsg, setToastMsg] = useState(null);

  function toast(text) {
    setToastMsg(text);
    setTimeout(() => setToastMsg(null), 3000);
  }

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [appsData, jobsData] = await Promise.all([
        apiMyApplications().catch(() => null),
        apiGetJobs().catch(() => []),
      ]);

      if (Array.isArray(appsData) && appsData.length > 0) {
        setApplications(appsData.map(a => ({
          id: a._id || a.id,
          jobId: a.job?._id || a.job?.id || "",
          jobTitle: a.job?.title || "Software Engineer",
          company: a.job?.company || "Tech Innovator",
          location: a.job?.location || "Remote",
          status: a.status || "Applied",
          appliedOn: a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "2025-01-10",
        })));
      } else {
        setApplications(DEMO_APPLICATIONS);
      }

      if (Array.isArray(jobsData) && jobsData.length > 0) {
        setJobs(jobsData.map(j => ({
          id: j._id || j.id,
          title: j.title || "Developer",
          company: j.company || "Global Tech",
          location: j.location || "Remote",
          type: j.type || "Full-Time",
          salary: j.minSalary ? `₹${j.minSalary}–${j.maxSalary} LPA` : "₹20–30 LPA",
          skills: Array.isArray(j.skills) ? j.skills : ["React", "Node.js"],
          domain: j.domain || "Engineering",
        })));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const stats = useMemo(() => ({
    total: applications.length,
    reviewing: applications.filter(a => a.status === "Reviewing" || a.status === "In Review").length,
    accepted: applications.filter(a => a.status === "Accepted" || a.status === "Offer").length,
    saved: savedJobs.length,
  }), [applications, savedJobs]);

  const userName = user?.name || "Alex Rivers";

  return (
    <div className="dash-page">
      {toastMsg && <div className="dash-toast">{toastMsg}</div>}

      {/* COMMAND CENTER HERO */}
      <header className="dash-hero-banner">
        <div className="dash-hero-text">
          <div className="dash-hero-badge">⚡ Candidate Command Center</div>
          <h1>Welcome back, {userName} 👋</h1>
          <p>Track live application stages, saved roles, and engineering opportunity recommendations.</p>
        </div>

        <div className="dash-hero-actions">
          <button className="btn-dash-primary" onClick={() => navigate("/companies")}>
            🔍 Browse Open Roles
          </button>
          <button className="btn-dash-secondary" onClick={() => navigate("/profile")}>
            👤 Manage Profile
          </button>
        </div>
      </header>

      {/* METRICS GRID */}
      <section className="dash-metrics-grid">
        <div className="dash-metric-card">
          <span className="metric-icon">📋</span>
          <div className="metric-info">
            <span className="metric-title">Total Applications</span>
            <strong className="metric-num">{stats.total}</strong>
          </div>
        </div>

        <div className="dash-metric-card yellow">
          <span className="metric-icon">🔍</span>
          <div className="metric-info">
            <span className="metric-title">Under Review</span>
            <strong className="metric-num">{stats.reviewing}</strong>
          </div>
        </div>

        <div className="dash-metric-card green">
          <span className="metric-icon">🎉</span>
          <div className="metric-info">
            <span className="metric-title">Accepted / Offers</span>
            <strong className="metric-num">{stats.accepted}</strong>
          </div>
        </div>

        <div className="dash-metric-card purple">
          <span className="metric-icon">🔖</span>
          <div className="metric-info">
            <span className="metric-title">Saved Bookmarks</span>
            <strong className="metric-num">{stats.saved}</strong>
          </div>
        </div>
      </section>

      {/* NAVIGATION TABS */}
      <nav className="dash-tabs-bar">
        {[
          { id: "overview", label: "📊 Overview" },
          { id: "applied", label: `📋 Active Applications (${stats.total})` },
          { id: "saved", label: `🔖 Saved Roles (${stats.saved})` },
          { id: "browse", label: "⚡ Recommended Jobs" },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`dash-tab-chip ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="dash-overview-grid">
          <div className="dash-panel-card">
            <h3>Recent Activity</h3>
            <div className="recent-activity-list">
              {applications.slice(0, 4).map((app) => (
                <div key={app.id} className="activity-item">
                  <div className="activity-avatar">{app.company.charAt(0)}</div>
                  <div className="activity-meta">
                    <h4>{app.jobTitle}</h4>
                    <p>{app.company} • Applied on {app.appliedOn}</p>
                  </div>
                  <span className={`dash-status-pill ${app.status.toLowerCase()}`}>{app.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="dash-panel-card">
            <h3>Quick Actions & Tools</h3>
            <div className="quick-actions-box">
              <button className="quick-action-btn" onClick={() => navigate("/applications")}>
                <span>📋</span> View Detailed Application Pipeline ➔
              </button>
              <button className="quick-action-btn" onClick={() => navigate("/profile")}>
                <span>📄</span> Update Resume & Portfolio PDF ➔
              </button>
              <button className="quick-action-btn" onClick={() => navigate("/companies")}>
                <span>🎯</span> Filter Roles by Salary & Domain ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ACTIVE APPLICATIONS */}
      {activeTab === "applied" && (
        <div className="dash-panel-card">
          <h3>Your Submitted Applications</h3>
          <div className="applications-table-list">
            {applications.map((app) => (
              <div key={app.id} className="app-table-row">
                <div className="app-row-company">
                  <div className="company-badge-avatar">{app.company.charAt(0)}</div>
                  <div>
                    <h4>{app.jobTitle}</h4>
                    <p>{app.company} • {app.location}</p>
                  </div>
                </div>
                <div className="app-row-date">Applied: {app.appliedOn}</div>
                <span className={`dash-status-pill ${app.status.toLowerCase()}`}>{app.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: SAVED ROLES */}
      {activeTab === "saved" && (
        <div className="dash-panel-card">
          <h3>Bookmarked Roles ({savedJobs.length})</h3>
          <p className="section-desc">Roles you saved for later application.</p>

          <div className="saved-jobs-grid">
            {savedJobs.length === 0 ? (
              <p style={{ color: "#94a3b8" }}>No saved jobs found. Click ❤️ Save on Browse Roles to bookmark opportunities.</p>
            ) : (
              savedJobs.map((sId) => (
                <div key={sId} className="saved-mini-card">
                  <h4>Developer Position</h4>
                  <p>Tech Innovator Labs • Remote</p>
                  <button className="btn-dash-primary" onClick={() => navigate("/companies")}>
                    Apply Now ⚡
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: RECOMMENDED JOBS */}
      {activeTab === "browse" && (
        <div className="dash-panel-card">
          <h3>Recommended for Your Tech Stack</h3>
          <div className="recommended-jobs-grid">
            {[
              { id: 101, title: "Staff Frontend Architect", company: "Stripe", salary: "₹35–50 LPA", domain: "Frontend" },
              { id: 102, title: "Principal Cloud Engineer", company: "Datadog", salary: "₹40–60 LPA", domain: "Cloud" },
              { id: 103, title: "Lead AI Systems Engineer", company: "OpenAI Labs", salary: "₹45–70 LPA", domain: "Data & ML" },
            ].map((j) => (
              <div key={j.id} className="recommended-card">
                <div className="rec-card-top">
                  <div>
                    <h4>{j.title}</h4>
                    <p>{j.company} • Remote</p>
                  </div>
                  <span className="type-pill">{j.domain}</span>
                </div>
                <div className="rec-card-footer">
                  <span className="salary-pill">{j.salary}</span>
                  <button className="btn-dash-primary" onClick={() => navigate("/companies")}>
                    View & Apply ➔
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

