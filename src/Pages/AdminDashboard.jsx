// src/Pages/AdminDashboard.jsx — Fully functional employer dashboard
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import {
  apiEmployerApplications,
  apiUpdateStatus,
  apiGetJobs,
  apiDeleteJob,
  getBackendBase,
} from "../api";

const STATUS_OPTIONS = ["Applied", "Reviewing", "Accepted", "Rejected"];
const STATUS_COLORS  = {
  Applied:   { bg: "rgba(59,130,246,0.15)",  color: "#60a5fa" },
  Reviewing: { bg: "rgba(245,158,11,0.15)", color: "#fbbf24" },
  Accepted:  { bg: "rgba(34,197,94,0.15)",  color: "#4ade80" },
  Rejected:  { bg: "rgba(239,68,68,0.15)",  color: "#f87171" },
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  // ─── State ─────────────────────────────────────────────────
  const [user,         setUser]         = useState(null);
  const [apps,         setApps]         = useState([]);
  const [jobs,         setJobs]         = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [jobFilter,    setJobFilter]    = useState("All");
  const [search,       setSearch]       = useState("");
  const [loading,      setLoading]      = useState(true);
  const [updatingId,   setUpdatingId]   = useState(null);
  const [deletingId,   setDeletingId]   = useState(null);
  const [activeTab,    setActiveTab]    = useState("overview"); // overview | applications | jobs
  const [toastMsg,     setToastMsg]     = useState(null); // { type, text }
  const backendBase = getBackendBase();

  // ─── Toast helper ──────────────────────────────────────────
  function toast(type, text) {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3500);
  }

  // ─── Load user from localStorage ──────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem("jb_user");
      if (raw) setUser(JSON.parse(raw));
    } catch {
      setUser(null);
    }
  }, []);

  // ─── Load data from backend ────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [appsData, jobsData] = await Promise.all([
        apiEmployerApplications().catch(() => []),
        apiGetJobs().catch(() => []),
      ]);
      if (Array.isArray(appsData)) setApps(appsData);
      if (Array.isArray(jobsData)) setJobs(jobsData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ─── Aggregate stats ───────────────────────────────────────
  const stats = useMemo(() => ({
    total:       apps.length,
    applied:     apps.filter(a => (a.status||"").toLowerCase() === "applied").length,
    reviewing:   apps.filter(a => (a.status||"").toLowerCase() === "reviewing").length,
    accepted:    apps.filter(a => (a.status||"").toLowerCase() === "accepted").length,
    rejected:    apps.filter(a => (a.status||"").toLowerCase() === "rejected").length,
    openJobs:    jobs.filter(j => (j.status||"active") === "active").length,
    totalJobs:   jobs.length,
  }), [apps, jobs]);

  // ─── Job+counts map ────────────────────────────────────────
  const jobsWithCounts = useMemo(() => {
    const map = new Map();
    apps.forEach(app => {
      const id = app.job?._id || app.job?.id || "unknown";
      const entry = map.get(id) || {
        id,
        _id: id,
        title:    app.job?.title    || "Job",
        company:  app.job?.company  || "Company",
        location: app.job?.location || "",
        type:     app.job?.type     || "",
        mode:     app.job?.mode     || "",
        status:   app.job?.status   || "active",
        count: 0,
      };
      entry.count++;
      map.set(id, entry);
    });
    jobs.forEach(job => {
      const id = job._id || job.id;
      if (!id || map.has(id)) return;
      map.set(id, {
        id, _id: id,
        title:    job.title    || "Job",
        company:  job.company  || "Company",
        location: job.location || "",
        type:     job.type     || "",
        mode:     job.mode     || "",
        status:   job.status   || "active",
        count: 0,
      });
    });
    return Array.from(map.values());
  }, [apps, jobs]);

  // ─── Filtered applications for table ──────────────────────
  const displayApps = useMemo(() => apps.map(a => ({
    id:             a._id || a.id,
    jobTitle:       a.job?.title     || "Job",
    company:        a.job?.company   || "Company",
    candidate:      a.applicant?.name  || "Candidate",
    candidateEmail: a.applicant?.email || "N/A",
    candidatePhone: a.applicant?.phone || "",
    resumeUrl:      a.applicant?.resumeUrl || "",
    coverLetter:    a.coverLetter || "",
    status:         a.status || "Applied",
    created:        a.createdAt ? new Date(a.createdAt) : null,
    updated:        a.updatedAt ? new Date(a.updatedAt) : null,
  })), [apps]);

  const filteredApps = useMemo(() => displayApps.filter(a => {
    const matchStatus = statusFilter === "All" || a.status.toLowerCase() === statusFilter.toLowerCase();
    const matchJob    = jobFilter === "All" || a.jobTitle.toLowerCase() === jobFilter.toLowerCase();
    const text        = (a.jobTitle + a.company + a.candidate + a.candidateEmail).toLowerCase();
    return matchStatus && matchJob && text.includes(search.toLowerCase());
  }), [displayApps, statusFilter, jobFilter, search]);

  // ─── Status change ─────────────────────────────────────────
  async function handleStatusChange(id, newStatus) {
    setUpdatingId(id);
    try {
      await apiUpdateStatus(id, newStatus);
      setApps(prev => prev.map(a => (a._id || a.id) === id ? { ...a, status: newStatus } : a));
      toast("success", `✅ Status updated to "${newStatus}"`);
    } catch (err) {
      toast("error", `❌ Update failed: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  }

  // ─── Delete job ────────────────────────────────────────────
  async function handleDeleteJob(jobId, jobTitle) {
    if (!window.confirm(`Delete job "${jobTitle}"? This will also remove all its applications.`)) return;
    setDeletingId(jobId);
    try {
      await apiDeleteJob(jobId);
      setJobs(prev => prev.filter(j => (j._id || j.id) !== jobId));
      setApps(prev => prev.filter(a => (a.job?._id || a.job?.id) !== jobId));
      toast("success", `✅ Job "${jobTitle}" deleted.`);
    } catch (err) {
      toast("error", `❌ Delete failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  }

  const adminName    = user?.name || (user?.email ? user.email.split("@")[0] : "Admin");
  const adminInitial = adminName.charAt(0).toUpperCase();

  // ─── Mini bar-chart data ───────────────────────────────────
  const chartMax  = Math.max(stats.applied, stats.reviewing, stats.accepted, stats.rejected, 1);
  const chartData = [
    { label: "Applied",   value: stats.applied,   color: "#60a5fa" },
    { label: "Reviewing", value: stats.reviewing,  color: "#fbbf24" },
    { label: "Accepted",  value: stats.accepted,   color: "#4ade80" },
    { label: "Rejected",  value: stats.rejected,   color: "#f87171" },
  ];

  return (
    <div className="admin-dashboard">

      {/* ─── TOAST ─────────────────────────────────────────── */}
      {toastMsg && (
        <div className={`ad-toast ${toastMsg.type}`}>{toastMsg.text}</div>
      )}

      {/* ─── HEADER ────────────────────────────────────────── */}
      <header className="ad-header">
        <div>
          <p className="ad-welcome">Welcome back, <span>{adminName}</span> 👋</p>
          <h1>Admin Dashboard</h1>
          <p className="ad-subtext">
            Manage job postings, review applications, and track your hiring pipeline.
          </p>
        </div>
        <div className="ad-header-right">
          <div className="ad-user-pill">
            <div className="ad-avatar">{adminInitial}</div>
            <div>
              <p className="ad-user-name">{adminName}</p>
              <p className="ad-user-role">Admin • Employer</p>
            </div>
          </div>
          <div className="ad-header-actions">
            <button className="ad-btn ad-btn-primary" onClick={() => navigate("/post")}>
              + Post Job
            </button>
            <button className="ad-btn ad-btn-outline" onClick={loadData} disabled={loading}>
              {loading ? "⟳" : "↻"} Refresh
            </button>
          </div>
        </div>
      </header>

      {/* ─── STAT CARDS ────────────────────────────────────── */}
      <section className="ad-stats">
        {[
          { label: "Total Applications", value: stats.total,     footer: "Across all your postings", icon: "📋", color: "#60a5fa" },
          { label: "Open Roles",         value: stats.openJobs,  footer: `${stats.totalJobs} total postings`, icon: "💼", color: "#4ade80" },
          { label: "Reviewing",          value: stats.reviewing, footer: "Being actively considered", icon: "🔍", color: "#fbbf24" },
          { label: "Accepted",           value: stats.accepted,  footer: "Successful hires this period", icon: "✅", color: "#34d399" },
        ].map(card => (
          <div key={card.label} className="ad-stat-card" style={{ "--card-accent": card.color }}>
            <div className="ad-stat-icon">{card.icon}</div>
            <div>
              <p className="ad-stat-label">{card.label}</p>
              <h2 style={{ color: card.color }}>{card.value}</h2>
              <p className="ad-stat-footer">{card.footer}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ─── TAB NAV ───────────────────────────────────────── */}
      <nav className="ad-tab-nav">
        {[
          { id: "overview",     label: "📊 Overview" },
          { id: "applications", label: "📋 Applications" },
          { id: "jobs",         label: "💼 My Jobs" },
        ].map(tab => (
          <button key={tab.id}
            className={`ad-tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* ══════════════════════════════════════════════════════
          TAB: OVERVIEW
          ══════════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <section className="ad-main-layout">

          {/* Application Status Chart */}
          <div className="ad-panel">
            <div className="ad-panel-header">
              <h2>Application Pipeline</h2>
              <span>{stats.total} total</span>
            </div>
            <div className="ad-chart">
              {chartData.map(bar => (
                <div key={bar.label} className="ad-chart-row">
                  <span className="ad-chart-label">{bar.label}</span>
                  <div className="ad-chart-track">
                    <div className="ad-chart-bar"
                      style={{
                        width: `${chartMax > 0 ? (bar.value / chartMax) * 100 : 0}%`,
                        background: bar.color,
                      }} />
                  </div>
                  <span className="ad-chart-val" style={{ color: bar.color }}>{bar.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Applications */}
          <div className="ad-panel">
            <div className="ad-panel-header">
              <h2>Recent Applications</h2>
              <button className="ad-tab-link" onClick={() => setActiveTab("applications")}>
                View all →
              </button>
            </div>
            {loading ? (
              <div className="ad-loading"><div className="ad-spinner" />Loading…</div>
            ) : displayApps.length === 0 ? (
              <p className="ad-empty">No applications yet. Share your job postings to attract candidates.</p>
            ) : (
              <div className="ad-recent-list">
                {displayApps.slice(0, 5).map(a => (
                  <div key={a.id} className="ad-recent-item">
                    <div className="ad-candidate-avatar">{(a.candidate || "?").charAt(0).toUpperCase()}</div>
                    <div className="ad-recent-info">
                      <p className="ad-recent-name">{a.candidate}</p>
                      <p className="ad-recent-job">{a.jobTitle} · {a.company}</p>
                    </div>
                    <div>
                      <span className="ad-status-pill" style={STATUS_COLORS[a.status] || {}}>
                        {a.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Jobs overview */}
          <div className="ad-panel">
            <div className="ad-panel-header">
              <h2>Your Job Postings</h2>
              <button className="ad-tab-link" onClick={() => setActiveTab("jobs")}>View all →</button>
            </div>
            {jobsWithCounts.slice(0, 4).map(job => (
              <div key={job.id} className="ad-job-card">
                <div>
                  <h3>{job.title}</h3>
                  <p className="ad-job-meta">
                    {job.company}{job.location && ` • ${job.location}`}{job.type && ` • ${job.type}`}
                  </p>
                  <p className="ad-job-apps">{job.count} application{job.count !== 1 ? "s" : ""}</p>
                </div>
                <div className="ad-job-right">
                  <span className={`ad-badge ${job.status === "closed" ? "ad-closed" : "ad-open"}`}>
                    {job.status === "closed" ? "Closed" : "Open"}
                  </span>
                </div>
              </div>
            ))}
            {jobsWithCounts.length === 0 && (
              <p className="ad-empty">No jobs posted yet.</p>
            )}
          </div>

          {/* Quick actions sidebar */}
          <div className="ad-panel">
            <div className="ad-panel-header"><h2>Quick Actions</h2></div>
            <div className="ad-quick-actions">
              <button className="ad-quick-btn" onClick={() => navigate("/post")}>
                <span>📝</span>
                <div>
                  <strong>Post a New Job</strong>
                  <small>Create a new job listing</small>
                </div>
              </button>
              <button className="ad-quick-btn" onClick={() => setActiveTab("applications")}>
                <span>👥</span>
                <div>
                  <strong>Review Applications</strong>
                  <small>{stats.reviewing} pending review</small>
                </div>
              </button>
              <button className="ad-quick-btn" onClick={() => setActiveTab("jobs")}>
                <span>💼</span>
                <div>
                  <strong>Manage Jobs</strong>
                  <small>{stats.openJobs} active roles</small>
                </div>
              </button>
              <button className="ad-quick-btn" onClick={loadData}>
                <span>🔄</span>
                <div>
                  <strong>Refresh Data</strong>
                  <small>Sync latest from server</small>
                </div>
              </button>
            </div>
          </div>

        </section>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: APPLICATIONS
          ══════════════════════════════════════════════════ */}
      {activeTab === "applications" && (
        <section className="ad-applications-tab">

          {/* Filters */}
          <div className="ad-filters">
            <div className="ad-filter-group">
              <label>Filter by job</label>
              <select value={jobFilter} onChange={e => setJobFilter(e.target.value)}>
                <option value="All">All jobs</option>
                {jobsWithCounts.map(j => (
                  <option key={j.id} value={j.title}>{j.title}</option>
                ))}
              </select>
            </div>
            <div className="ad-filter-group">
              <label>Status</label>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="All">All statuses</option>
                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="ad-filter-group" style={{ flex: 2 }}>
              <label>Search candidates</label>
              <input type="text" placeholder="Search by name, email, job title…"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          {/* Table */}
          <div className="ad-panel" style={{ marginTop: "1rem" }}>
            <div className="ad-panel-header">
              <h2>Applications</h2>
              <span>{filteredApps.length} result{filteredApps.length !== 1 ? "s" : ""}</span>
            </div>

            {loading ? (
              <div className="ad-loading"><div className="ad-spinner" />Loading applications…</div>
            ) : filteredApps.length === 0 ? (
              <p className="ad-empty">No applications match your filters.</p>
            ) : (
              <div className="ad-table-wrapper">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Email</th>
                      <th>Job</th>
                      <th>Applied</th>
                      <th>Status</th>
                      <th>Cover Letter</th>
                      <th>Resume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApps.map(a => (
                      <tr key={a.id}>
                        <td>
                          <div className="ad-candidate-row">
                            <div className="ad-candidate-avatar sm">
                              {(a.candidate || "?").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <strong>{a.candidate}</strong>
                              {a.candidatePhone && <small style={{ display: "block", color: "#64748b" }}>{a.candidatePhone}</small>}
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: "0.82rem", color: "#94a3b8" }}>{a.candidateEmail}</td>
                        <td>
                          <span style={{ fontWeight: 500 }}>{a.jobTitle}</span>
                          <small style={{ display: "block", color: "#64748b" }}>{a.company}</small>
                        </td>
                        <td style={{ fontSize: "0.8rem", color: "#64748b" }}>
                          {a.created ? a.created.toLocaleDateString() : "—"}
                        </td>
                        <td>
                          <select
                            className="ad-status-select"
                            value={a.status}
                            disabled={updatingId === a.id}
                            onChange={e => handleStatusChange(a.id, e.target.value)}
                            style={STATUS_COLORS[a.status] || {}}
                          >
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td>
                          {a.coverLetter
                            ? <span className="ad-cover-preview" title={a.coverLetter}>
                                {a.coverLetter.slice(0, 40)}{a.coverLetter.length > 40 ? "…" : ""}
                              </span>
                            : <span style={{ color: "#475569", fontSize: "0.8rem" }}>—</span>
                          }
                        </td>
                        <td>
                          {a.resumeUrl
                            ? <a href={`${backendBase}${a.resumeUrl}`} target="_blank"
                                rel="noreferrer" className="ad-resume-link">View ↗</a>
                            : <span style={{ color: "#475569", fontSize: "0.8rem" }}>—</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: JOBS
          ══════════════════════════════════════════════════ */}
      {activeTab === "jobs" && (
        <section className="ad-jobs-tab">
          <div className="ad-jobs-tab-header">
            <h2>{jobsWithCounts.length} Job Posting{jobsWithCounts.length !== 1 ? "s" : ""}</h2>
            <button className="ad-btn ad-btn-primary" onClick={() => navigate("/post")}>
              + Post New Job
            </button>
          </div>

          {loading ? (
            <div className="ad-loading"><div className="ad-spinner" />Loading jobs…</div>
          ) : jobsWithCounts.length === 0 ? (
            <div className="ad-empty-jobs">
              <p>💼</p>
              <h3>No jobs posted yet</h3>
              <p>Create your first job listing to start receiving applications.</p>
              <button className="ad-btn ad-btn-primary" onClick={() => navigate("/post")}>
                Post Your First Job
              </button>
            </div>
          ) : (
            <div className="ad-jobs-grid">
              {jobsWithCounts.map(job => (
                <div key={job.id} className="ad-job-tile">
                  <div className="ad-job-tile-top">
                    <div>
                      <h3>{job.title}</h3>
                      <p className="ad-job-tile-meta">
                        {job.company}
                        {job.location && ` • 📍${job.location}`}
                        {job.type && ` • ${job.type}`}
                        {job.mode && ` • ${job.mode}`}
                      </p>
                    </div>
                    <span className={`ad-badge ${job.status === "closed" ? "ad-closed" : "ad-open"}`}>
                      {job.status === "closed" ? "Closed" : "Active"}
                    </span>
                  </div>

                  <div className="ad-job-tile-stats">
                    <div className="ad-tile-stat">
                      <span className="ad-tile-num">{job.count}</span>
                      <span className="ad-tile-lbl">Applications</span>
                    </div>
                    <div className="ad-tile-stat">
                      <span className="ad-tile-num" style={{ color: "#4ade80" }}>
                        {apps.filter(a => (a.job?._id || a.job?.id) === job.id && a.status === "Accepted").length}
                      </span>
                      <span className="ad-tile-lbl">Accepted</span>
                    </div>
                    <div className="ad-tile-stat">
                      <span className="ad-tile-num" style={{ color: "#fbbf24" }}>
                        {apps.filter(a => (a.job?._id || a.job?.id) === job.id && a.status === "Reviewing").length}
                      </span>
                      <span className="ad-tile-lbl">Reviewing</span>
                    </div>
                  </div>

                  <div className="ad-job-tile-actions">
                    <button className="ad-btn ad-btn-sm ad-btn-outline"
                      onClick={() => { setActiveTab("applications"); setJobFilter(job.title); }}>
                      View Applications
                    </button>
                    <button className="ad-btn ad-btn-sm ad-btn-outline"
                      onClick={() => navigate("/post", { state: { editJob: job } })}>
                      Edit
                    </button>
                    <button className="ad-btn ad-btn-sm ad-btn-danger"
                      disabled={deletingId === job._id || deletingId === job.id}
                      onClick={() => handleDeleteJob(job._id || job.id, job.title)}>
                      {deletingId === (job._id || job.id) ? "…" : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
