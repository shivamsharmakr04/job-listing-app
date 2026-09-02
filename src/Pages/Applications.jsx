// src/Pages/Applications.jsx
import React, { useEffect, useState } from "react";
import "./Applications.css";
import { apiMyApplications } from "../api";

const STORAGE_KEY = "jb_applications";

const DEMO_APPLICATIONS = [
  {
    id: 1,
    title: "Senior Frontend Engineer",
    company: "Google",
    location: "Remote",
    status: "In Review",
    appliedOn: "2025-01-10",
    updatedOn: "2025-01-15",
    type: "Full-Time",
    domain: "Frontend",
    salary: "₹24–35 LPA",
    stageNote: "Your resume is currently under evaluation by the Lead Tech Recruiter.",
  },
  {
    id: 2,
    title: "Backend Architect",
    company: "Amazon",
    location: "Bangalore",
    status: "Shortlisted",
    appliedOn: "2025-01-08",
    updatedOn: "2025-01-14",
    type: "Full-Time",
    domain: "Backend",
    salary: "₹30–45 LPA",
    stageNote: "Shortlisted! Systems design interview scheduled for next Tuesday.",
  },
  {
    id: 3,
    title: "UI/UX Product Designer",
    company: "Microsoft",
    location: "Hyderabad",
    status: "Applied",
    appliedOn: "2025-01-12",
    updatedOn: "2025-01-12",
    type: "Hybrid",
    domain: "Design",
    salary: "₹22–32 LPA",
    stageNote: "Application submitted successfully. Awaiting recruiter review.",
  },
  {
    id: 4,
    title: "Full Stack AI Developer",
    company: "Netflix",
    location: "Remote",
    status: "Offer",
    appliedOn: "2024-12-20",
    updatedOn: "2025-01-05",
    type: "Contract",
    domain: "Full Stack",
    salary: "₹28–40 LPA",
    stageNote: "🎉 Congratulations! Official offer letter dispatched via email.",
  },
];

const STATUS_FILTERS = ["All", "Applied", "In Review", "Shortlisted", "Offer", "Rejected"];

export default function Applications() {
  const [applications, setApplications] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEMO_APPLICATIONS;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEMO_APPLICATIONS;
    } catch {
      return DEMO_APPLICATIONS;
    }
  });

  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
    } catch {}
  }, [applications]);

  useEffect(() => {
    apiMyApplications()
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) return;
        const mapped = data.map((app) => ({
          id: app._id || app.id,
          title: app.job?.title || app.title || "Software Engineer",
          company: app.job?.company || app.company || "Tech Innovator",
          location: app.job?.location || app.location || "Remote",
          status: app.status || "Applied",
          appliedOn: app.createdAt || app.appliedOn || new Date().toISOString(),
          updatedOn: app.updatedAt || app.updatedOn || new Date().toISOString(),
          type: app.job?.type || app.type || "Full-Time",
          domain: app.job?.domain || app.domain || "Engineering",
          salary: app.job?.salaryRange || app.salary || "₹18–25 LPA",
          stageNote: app.note || app.stageNote || "Application under review.",
        }));
        setApplications(mapped);
      })
      .catch(() => {});
  }, []);

  const totalCount = applications.length;
  const inReviewCount = applications.filter((a) => a.status === "In Review" || a.status === "Applied").length;
  const shortlistedCount = applications.filter((a) => a.status === "Shortlisted" || a.status === "Interview").length;
  const offersCount = applications.filter((a) => a.status === "Offer").length;

  const filteredApps = applications
    .filter((app) => {
      const matchesStatus = statusFilter === "All" || app.status === statusFilter;
      const matchesSearch = (app.title + app.company + app.location).toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "recent") return new Date(b.updatedOn || b.appliedOn) - new Date(a.updatedOn || a.appliedOn);
      if (sortBy === "oldest") return new Date(a.appliedOn) - new Date(b.appliedOn);
      return a.title.localeCompare(b.title);
    });

  return (
    <div className="apps-page">
      {/* Header Banner */}
      <header className="apps-hero-banner">
        <div>
          <div className="apps-badge">📋 Track Your Progress</div>
          <h1>Application Status Tracker</h1>
          <p>Monitor real-time updates and interview pipeline stages for your applied roles.</p>
        </div>
        <button className="btn-seed-demo" onClick={() => setApplications(DEMO_APPLICATIONS)}>
          Reload Demo Applications
        </button>
      </header>

      {/* Summary Metrics Bar */}
      <div className="apps-metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Total Applied</span>
          <strong className="metric-value">{totalCount}</strong>
          <span className="metric-sub">Active Applications</span>
        </div>
        <div className="metric-card yellow">
          <span className="metric-label">Under Review</span>
          <strong className="metric-value">{inReviewCount}</strong>
          <span className="metric-sub">Pending Hiring Review</span>
        </div>
        <div className="metric-card cyan">
          <span className="metric-label">Shortlisted</span>
          <strong className="metric-value">{shortlistedCount}</strong>
          <span className="metric-sub">Interview Pipeline</span>
        </div>
        <div className="metric-card green">
          <span className="metric-label">Offers Received</span>
          <strong className="metric-value">{offersCount}</strong>
          <span className="metric-sub">🎉 Job Offers</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="apps-toolbar">
        <div className="apps-search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by job title or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="apps-filters-row">
          {STATUS_FILTERS.map((st) => (
            <button
              key={st}
              type="button"
              className={`apps-filter-chip ${statusFilter === st ? "active" : ""}`}
              onClick={() => setStatusFilter(st)}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="apps-sort-wrapper">
          <label>Sort:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="recent">Recently Updated</option>
            <option value="oldest">First Applied</option>
            <option value="title">Role Title</option>
          </select>
        </div>
      </div>

      {/* Application Cards List */}
      <section className="apps-cards-list">
        {filteredApps.length === 0 ? (
          <div className="apps-empty-card">
            <div className="empty-icon">📁</div>
            <h3>No applications match your selection</h3>
            <p>Applied jobs will appear here automatically when you submit applications.</p>
          </div>
        ) : (
          filteredApps.map((app) => (
            <article key={app.id} className="app-glass-item">
              <div className="app-card-left">
                <div className="company-logo-avatar">
                  {app.company.charAt(0).toUpperCase()}
                </div>

                <div className="app-info-block">
                  <div className="app-title-line">
                    <h2>{app.title}</h2>
                    <span className={`status-pill ${statusClass(app.status)}`}>{app.status}</span>
                  </div>

                  <p className="app-company-sub">
                    <strong>{app.company}</strong> • <span className="location-txt">{app.location}</span>
                  </p>

                  <div className="app-tags-group">
                    <span className="tag-chip">{app.type}</span>
                    <span className="tag-chip salary">{app.salary}</span>
                    <span className="tag-chip">{app.domain || "Software"}</span>
                  </div>

                  <div className="app-stage-note-box">
                    <span className="note-icon">💬</span>
                    <p>{app.stageNote}</p>
                  </div>
                </div>
              </div>

              <div className="app-card-right">
                <div className="app-dates-info">
                  <span>Applied: <strong>{formatDate(app.appliedOn)}</strong></span>
                  <span>Updated: <strong>{formatDate(app.updatedOn || app.appliedOn)}</strong></span>
                </div>

                {/* Progress Dots Bar */}
                <div className="pipeline-progress-wrap">
                  <span className="pipeline-label">Stage Progress</span>
                  <div className="pipeline-dots-row">
                    {["Applied", "In Review", "Shortlisted", "Offer"].map((stage) => {
                      const reached = isStageReached(app.status, stage);
                      return (
                        <div
                          key={stage}
                          className={`pipeline-step ${reached ? "active" : ""}`}
                          title={stage}
                        >
                          <span className="step-dot" />
                          <span className="step-name">{stage}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

function statusClass(status) {
  switch (status) {
    case "Applied": return "applied";
    case "In Review": return "review";
    case "Shortlisted": return "shortlisted";
    case "Offer": return "offer";
    case "Rejected": return "rejected";
    default: return "applied";
  }
}

function isStageReached(currentStatus, stage) {
  const order = ["Applied", "In Review", "Shortlisted", "Offer"];
  const idxStage = order.indexOf(stage);
  const idxCurrent = order.indexOf(currentStatus);
  if (currentStatus === "Rejected") return idxStage === 0;
  return idxCurrent >= idxStage;
}

function formatDate(str) {
  if (!str) return "N/A";
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return str;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

