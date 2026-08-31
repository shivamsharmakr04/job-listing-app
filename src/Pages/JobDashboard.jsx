// src/Pages/JobDashboard.jsx — Fully functional job seeker dashboard
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./JobDashboard.css";
import { apiMyApplications, apiGetJobs, apiApplyJob, apiWithdrawApplication } from "../api";

const DEMO_APPLICATIONS = [
  { id: "d1", jobTitle: "Frontend Developer",    company: "Google",    status: "Reviewing",  appliedOn: "2025-01-10", jobId: "d1" },
  { id: "d2", jobTitle: "Backend Engineer",       company: "Amazon",   status: "Accepted",   appliedOn: "2025-01-08", jobId: "d2" },
  { id: "d3", jobTitle: "UI/UX Designer Intern",  company: "Microsoft",status: "Applied",    appliedOn: "2025-01-12", jobId: "d3" },
  { id: "d4", jobTitle: "Data Analyst",           company: "IBM",      status: "Rejected",   appliedOn: "2024-12-20", jobId: "d4" },
];

const STAGE_ORDER = ["Applied", "Reviewing", "Accepted", "Rejected"];

export default function JobDashboard() {
  const navigate   = useNavigate();
  const [user]     = useState(() => {
    try {
      const u = localStorage.getItem("jb_user");
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  });

  const [applications, setApplications] = useState([]);
  const [jobs,         setJobs]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [savedJobs,    setSavedJobs]    = useState(() => {
    try { return JSON.parse(localStorage.getItem("jb_saved_jobs") || "[]"); }
    catch { return []; }
  });
  const [activeTab,   setActiveTab]    = useState("overview");  // overview | applied | saved | browse
  const [statusFilter, setStatusFilter] = useState("All");
  const [search,      setSearch]       = useState("");
  const [toastMsg,    setToastMsg]     = useState(null);
  const [withdrawing, setWithdrawing]  = useState(null);

  function toast(type, text) {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3200);
  }

  // ─── Load data ─────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [appsData, jobsData] = await Promise.all([
        apiMyApplications().catch(() => null),
        apiGetJobs().catch(() => []),
      ]);

      if (Array.isArray(appsData) && appsData.length > 0) {
        setApplications(appsData.map(a => ({
          id:        a._id || a.id,
          jobId:     a.job?._id || a.job?.id || "",
          jobTitle:  a.job?.title    || "Job",
          company:   a.job?.company  || "Company",
          location:  a.job?.location || "",
          type:      a.job?.type     || "",
          mode:      a.job?.mode     || "",
          salary:    a.job?.minSalary ? `${a.job.currency || "₹"}${a.job.minSalary}–${a.job.maxSalary} LPA` : "",
          status:    a.status || "Applied",
          appliedOn: a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "—",
          coverLetter: a.coverLetter || "",
        })));
      } else {
        // fallback to demo
        setApplications(DEMO_APPLICATIONS);
      }

      if (Array.isArray(jobsData) && jobsData.length > 0) {
        setJobs(jobsData.map(j => ({
          id:       j._id || j.id,
          title:    j.title || "Job",
          company:  j.company || "Company",
          location: j.location || "",
          type:     j.type || "",
          mode:     j.mode || "",
          salary:   j.minSalary ? `${j.currency || "₹"}${j.minSalary}–${j.maxSalary} LPA` : "",
          skills:   Array.isArray(j.skills) ? j.skills : [],
          domain:   j.domain || "",
        })));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ─── Stats ─────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:     applications.length,
    applied:   applications.filter(a => a.status === "Applied").length,
    reviewing: applications.filter(a => a.status === "Reviewing").length,
    accepted:  applications.filter(a => a.status === "Accepted").length,
    rejected:  applications.filter(a => a.status === "Rejected").length,
    saved:     savedJobs.length,
  }), [applications, savedJobs]);

  // ─── Filtered applications ─────────────────────────────────
  const filteredApps = useMemo(() => applications.filter(a => {
    const matchStatus = statusFilter === "All" || a.status === statusFilter;
    const text        = (a.jobTitle + a.company + (a.location || "")).toLowerCase();
    return matchStatus && text.includes(search.toLowerCase());
  }), [applications, statusFilter, search]);

  // ─── Unsave job ────────────────────────────────────────────
  function unsaveJob(id) {
    const next = savedJobs.filter(j => j !== id);
    setSavedJobs(next);
    localStorage.setItem("jb_saved_jobs", JSON.stringify(next));
    toast("success", "Removed from saved jobs.");
  }

  // ─── Withdraw application ──────────────────────────────────
  async function handleWithdraw(app) {
    if (!window.confirm(`Withdraw your application for "${app.jobTitle}" at ${app.company}?`)) return;
    if (app.id.startsWith("d")) {
      setApplications(prev => prev.filter(a => a.id !== app.id));
      toast("success", "Application withdrawn.");
      return;
    }
    setWithdrawing(app.id);
    try {
      await apiWithdrawApplication(app.id);
      setApplications(prev => prev.filter(a => a.id !== app.id));
      toast("success", "✅ Application withdrawn successfully.");
    } catch (err) {
      toast("error", `❌ ${err.message}`);
    } finally {
      setWithdrawing(null);
    }
  }

  // ─── Quick apply from Browse ───────────────────────────────
  async function handleApply(job) {
    const token = localStorage.getItem("jb_token");
    if (!token) { toast("error", "Sign in first to apply."); return; }
    const already = applications.some(a => a.jobId === job.id);
    if (already) { toast("error", "You have already applied for this job."); return; }
    try {
      const res = await apiApplyJob(job.id, "");
      if (res && (res._id || res.id)) {
        toast("success", `✅ Applied to ${job.title} at ${job.company}!`);
        await loadData(); // refresh
      } else {
        toast("error", res?.message || "Could not apply. Try again.");
      }
    } catch (err) {
      toast("error", err.message || "Application failed.");
    }
  }

  const userName    = user?.name || "there";
  const userInitial = userName.charAt(0).toUpperCase();
  const userEmail   = user?.email || "";

  // ─── Recent 3 applications ─────────────────────────────────
  const recentApps = applications.slice(0, 3);

  // ─── Saved job objects ─────────────────────────────────────
  const savedJobObjects = jobs.filter(j => savedJobs.includes(j.id));

  return (
    <div className="jd-page">

      {/* ─── TOAST ─────────────────────────────────────────── */}
      {toastMsg && (
        <div className={`jd-toast ${toastMsg.type}`}>{toastMsg.text}</div>
      )}

      {/* ─── HEADER ────────────────────────────────────────── */}
      <header className="jd-header">
        <div>
          <p className="jd-welcome">Welcome back, <span>{userName}</span> 👋</p>
          <h1>My Dashboard</h1>
          <p className="jd-subtext">Track your applications and discover new opportunities.</p>
        </div>
        <div className="jd-header-right">
          <div className="jd-user-pill">
            <div className="jd-avatar">{userInitial}</div>
            <div>
              <p className="jd-user-name">{userName}</p>
              <p className="jd-user-email">{userEmail}</p>
            </div>
          </div>
          <div className="jd-header-actions">
            <button className="jd-btn jd-btn-primary" onClick={() => navigate("/companies")}>
              Browse Jobs
            </button>
            <button className="jd-btn jd-btn-outline" onClick={() => navigate("/profile")}>
              Edit Profile
            </button>
          </div>
        </div>
      </header>

      {/* ─── STAT CARDS ────────────────────────────────────── */}
      <section className="jd-stats">
        {[
          { label: "Total Applied", value: stats.total,     icon: "📋", color: "#60a5fa" },
          { label: "Reviewing",     value: stats.reviewing, icon: "🔍", color: "#fbbf24" },
          { label: "Accepted",      value: stats.accepted,  icon: "✅", color: "#4ade80" },
          { label: "Saved Jobs",    value: stats.saved,     icon: "🔖", color: "#a78bfa" },
        ].map(card => (
          <div key={card.label} className="jd-stat-card" style={{ "--accent": card.color }}>
            <span className="jd-stat-icon">{card.icon}</span>
            <div>
              <p className="jd-stat-label">{card.label}</p>
              <h2 style={{ color: card.color }}>{card.value}</h2>
            </div>
          </div>
        ))}
      </section>

      {/* ─── TAB NAV ───────────────────────────────────────── */}
      <nav className="jd-tab-nav">
        {[
          { id: "overview", label: "📊 Overview" },
          { id: "applied",  label: `📋 Applications (${stats.total})` },
          { id: "saved",    label: `🔖 Saved (${stats.saved})` },
          { id: "browse",   label: "🔍 Browse Jobs" },
        ].map(tab => (
          <button key={tab.id}
            className={`jd-tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* ══════════════════════════════════════════════════════
          TAB: OVERVIEW
          ══════════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <section className="jd-overview-grid">

          {/* Application progress */}
          <div className="jd-panel">
            <div className="jd-panel-header">
              <h2>Application Progress</h2>
            </div>
            {loading ? (
              <div className="jd-loading"><div className="jd-spinner" />Loading…</div>
            ) : (
              <div className="jd-progress-bars">
                {[
                  { label: "Applied",   val: stats.applied,   color: "#60a5fa" },
                  { label: "Reviewing", val: stats.reviewing, color: "#fbbf24" },
                  { label: "Accepted",  val: stats.accepted,  color: "#4ade80" },
                  { label: "Rejected",  val: stats.rejected,  color: "#f87171" },
                ].map(row => {
                  const pct = stats.total > 0 ? Math.round((row.val / stats.total) * 100) : 0;
                  return (
                    <div key={row.label} className="jd-prog-row">
                      <span>{row.label}</span>
                      <div className="jd-prog-track">
                        <div className="jd-prog-bar"
                          style={{ width: `${pct}%`, background: row.color }} />
                      </div>
                      <span style={{ color: row.color, minWidth: 24 }}>{row.val}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent applications */}
          <div className="jd-panel">
            <div className="jd-panel-header">
              <h2>Recent Applications</h2>
              <button className="jd-link-btn" onClick={() => setActiveTab("applied")}>View all →</button>
            </div>
            {recentApps.length === 0 ? (
              <p className="jd-empty">No applications yet. <button className="jd-link-btn" onClick={() => navigate("/companies")}>Browse jobs →</button></p>
            ) : (
              <div className="jd-recent-list">
                {recentApps.map(a => (
                  <div key={a.id} className="jd-recent-item">
                    <div className="jd-co-avatar">{(a.company || "?").charAt(0).toUpperCase()}</div>
                    <div className="jd-recent-info">
                      <p className="jd-recent-title">{a.jobTitle}</p>
                      <p className="jd-recent-co">{a.company}</p>
                    </div>
                    <span className={`jd-status-pill jd-s-${a.status.toLowerCase()}`}>{a.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profile completion hint */}
          <div className="jd-panel">
            <div className="jd-panel-header"><h2>Your Profile</h2></div>
            <div className="jd-profile-hint">
              <div className="jd-profile-avatar-lg">{userInitial}</div>
              <div>
                <h3>{userName}</h3>
                <p>{userEmail}</p>
                <p className="jd-profile-tip">
                  Complete your profile to stand out to employers.
                </p>
              </div>
            </div>
            <div className="jd-profile-actions">
              <button className="jd-btn jd-btn-primary" onClick={() => navigate("/profile")}>
                Edit Profile
              </button>
              <button className="jd-btn jd-btn-outline" onClick={() => navigate("/applications")}>
                Full Status
              </button>
            </div>
          </div>

          {/* Saved jobs preview */}
          <div className="jd-panel">
            <div className="jd-panel-header">
              <h2>Saved Jobs</h2>
              <button className="jd-link-btn" onClick={() => setActiveTab("saved")}>View all →</button>
            </div>
            {savedJobObjects.length === 0 ? (
              <p className="jd-empty">
                No saved jobs. <button className="jd-link-btn" onClick={() => setActiveTab("browse")}>Browse →</button>
              </p>
            ) : (
              <div className="jd-saved-mini">
                {savedJobObjects.slice(0, 3).map(job => (
                  <div key={job.id} className="jd-saved-mini-item">
                    <div>
                      <p className="jd-saved-title">{job.title}</p>
                      <p className="jd-saved-co">{job.company} {job.location && `• ${job.location}`}</p>
                    </div>
                    <button className="jd-btn jd-btn-sm jd-btn-outline" onClick={() => handleApply(job)}>
                      Apply
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </section>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: APPLICATIONS
          ══════════════════════════════════════════════════ */}
      {activeTab === "applied" && (
        <section className="jd-applied-tab">
          {/* Filters */}
          <div className="jd-app-filters">
            <div className="jd-filter-pills">
              {["All", "Applied", "Reviewing", "Accepted", "Rejected"].map(s => (
                <button key={s}
                  className={`jd-filter-pill ${statusFilter === s ? "active" : ""}`}
                  onClick={() => setStatusFilter(s)}>
                  {s}
                </button>
              ))}
            </div>
            <input type="text" className="jd-search-input"
              placeholder="Search job or company…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {loading ? (
            <div className="jd-loading"><div className="jd-spinner" />Loading applications…</div>
          ) : filteredApps.length === 0 ? (
            <div className="jd-empty-state">
              <span>📋</span>
              <h3>No applications found</h3>
              <p>Apply to jobs from the Browse or Home page.</p>
              <button className="jd-btn jd-btn-primary" onClick={() => navigate("/companies")}>
                Browse Jobs
              </button>
            </div>
          ) : (
            <div className="jd-app-cards">
              {filteredApps.map(a => (
                <div key={a.id} className="jd-app-card">
                  <div className="jd-app-card-top">
                    <div className="jd-co-avatar">{(a.company || "?").charAt(0).toUpperCase()}</div>
                    <div className="jd-app-info">
                      <h3>{a.jobTitle}</h3>
                      <p>{a.company}{a.location && ` • ${a.location}`}</p>
                      {a.type && <p style={{ fontSize: "0.78rem", color: "#64748b" }}>{a.type}{a.mode && ` • ${a.mode}`}{a.salary && ` • ${a.salary}`}</p>}
                    </div>
                    <span className={`jd-status-pill jd-s-${a.status.toLowerCase()}`}>{a.status}</span>
                  </div>

                  {/* Stage tracker */}
                  <div className="jd-stage-track">
                    {STAGE_ORDER.filter(s => s !== "Rejected").map((stage, i) => {
                      const idx    = STAGE_ORDER.indexOf(a.status);
                      const stageI = STAGE_ORDER.indexOf(stage);
                      const reached  = idx >= stageI && a.status !== "Rejected";
                      const rejected = a.status === "Rejected" && stageI <= 1;
                      return (
                        <React.Fragment key={stage}>
                          <div className={`jd-stage-dot ${reached || rejected ? "reached" : ""} ${a.status === "Rejected" ? "rejected" : ""}`} title={stage} />
                          {i < 2 && <div className={`jd-stage-line ${reached ? "reached" : ""}`} />}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  <div className="jd-app-card-footer">
                    <small>Applied: {a.appliedOn}</small>
                    {(a.status === "Applied" || a.status === "Reviewing") && (
                      <button className="jd-btn jd-btn-sm jd-btn-danger"
                        disabled={withdrawing === a.id}
                        onClick={() => handleWithdraw(a)}>
                        {withdrawing === a.id ? "Withdrawing…" : "Withdraw"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: SAVED JOBS
          ══════════════════════════════════════════════════ */}
      {activeTab === "saved" && (
        <section className="jd-saved-tab">
          <div className="jd-saved-header">
            <h2>Saved Jobs ({savedJobObjects.length})</h2>
            <button className="jd-btn jd-btn-outline" onClick={() => setActiveTab("browse")}>
              Browse More
            </button>
          </div>
          {savedJobObjects.length === 0 ? (
            <div className="jd-empty-state">
              <span>🔖</span>
              <h3>No saved jobs yet</h3>
              <p>Save jobs from the Home or Browse page to review them later.</p>
              <button className="jd-btn jd-btn-primary" onClick={() => navigate("/")}>
                Explore Jobs
              </button>
            </div>
          ) : (
            <div className="jd-saved-grid">
              {savedJobObjects.map(job => {
                const applied = applications.some(a => a.jobId === job.id);
                return (
                  <div key={job.id} className="jd-saved-card">
                    <div className="jd-saved-card-top">
                      <h3>{job.title}</h3>
                      <span className="jd-domain-pill">{job.domain}</span>
                    </div>
                    <p className="jd-saved-co">{job.company}{job.location && ` • ${job.location}`}</p>
                    <p className="jd-saved-meta">{job.type && job.type}{job.mode && ` • ${job.mode}`}{job.salary && ` • ${job.salary}`}</p>
                    {job.skills.length > 0 && (
                      <div className="jd-skill-chips">
                        {job.skills.slice(0, 3).map(s => <span key={s} className="jd-chip">{s}</span>)}
                      </div>
                    )}
                    <div className="jd-saved-card-actions">
                      {applied ? (
                        <button className="jd-btn jd-btn-sm jd-btn-outline" disabled>
                          ✓ Applied
                        </button>
                      ) : (
                        <button className="jd-btn jd-btn-sm jd-btn-primary" onClick={() => handleApply(job)}>
                          Apply Now
                        </button>
                      )}
                      <button className="jd-btn jd-btn-sm jd-btn-danger" onClick={() => unsaveJob(job.id)}>
                        Unsave
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: BROWSE JOBS
          ══════════════════════════════════════════════════ */}
      {activeTab === "browse" && (
        <section className="jd-browse-tab">
          <div className="jd-browse-header">
            <h2>Open Positions ({jobs.length})</h2>
            <button className="jd-btn jd-btn-outline" onClick={loadData} disabled={loading}>
              {loading ? "⟳" : "↻"} Refresh
            </button>
          </div>
          <input type="text" className="jd-search-input"
            placeholder="Search jobs…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ marginBottom: "16px" }} />

          {loading ? (
            <div className="jd-loading"><div className="jd-spinner" />Loading jobs…</div>
          ) : jobs.length === 0 ? (
            <p className="jd-empty">No jobs available right now.</p>
          ) : (
            <div className="jd-browse-grid">
              {jobs.filter(j => {
                const text = (j.title + j.company + j.location).toLowerCase();
                return text.includes(search.toLowerCase());
              }).map(job => {
                const isSaved   = savedJobs.includes(job.id);
                const isApplied = applications.some(a => a.jobId === job.id);
                return (
                  <div key={job.id} className="jd-browse-card">
                    <div className="jd-browse-top">
                      <h3>{job.title}</h3>
                      <span className="jd-domain-pill">{job.domain}</span>
                    </div>
                    <p className="jd-browse-co">{job.company}{job.location && ` • 📍${job.location}`}</p>
                    <p className="jd-browse-meta">
                      {job.type}{job.mode && ` • ${job.mode}`}{job.salary && ` • 💰${job.salary}`}
                    </p>
                    {job.skills.length > 0 && (
                      <div className="jd-skill-chips">
                        {job.skills.slice(0, 3).map(s => <span key={s} className="jd-chip">{s}</span>)}
                      </div>
                    )}
                    <div className="jd-browse-actions">
                      {isApplied ? (
                        <button className="jd-btn jd-btn-sm jd-btn-outline" disabled>✓ Applied</button>
                      ) : (
                        <button className="jd-btn jd-btn-sm jd-btn-primary" onClick={() => handleApply(job)}>
                          Quick Apply
                        </button>
                      )}
                      <button
                        className={`jd-btn jd-btn-sm ${isSaved ? "jd-btn-saved" : "jd-btn-outline"}`}
                        onClick={() => {
                          const next = isSaved ? savedJobs.filter(id => id !== job.id) : [...savedJobs, job.id];
                          setSavedJobs(next);
                          localStorage.setItem("jb_saved_jobs", JSON.stringify(next));
                          toast("success", isSaved ? "Removed from saved." : "Job saved!");
                        }}>
                        {isSaved ? "✓ Saved" : "Save"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
