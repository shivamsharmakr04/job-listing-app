// src/Pages/AdminDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ added this
import "./AdminDashboard.css";
import {
  apiEmployerApplications,
  apiUpdateStatus,
  apiGetJobs,
  apiDeleteJob,
} from "../api";

export default function AdminDashboard() {
  const navigate = useNavigate();

  // when admin clicks "Edit" on a job card
  function handleEditJob(jobId) {
    // find full job object from jobs[] loaded from backend
    const job = jobs.find((j) => (j._id || j.id) === jobId);
    if (!job) return;

    // store for JobPost page to read
    try {
      localStorage.setItem("jb_edit_job", JSON.stringify(job));
    } catch (e) {
      console.error("Failed to cache job for edit:", e);
    }

    // go to Job Post page (same UI, but pre-filled)
    navigate("/post");
  }

  // when admin clicks "Delete" on a job card
  async function handleDeleteJob(jobId) {
    if (!window.confirm("Delete this job permanently?")) return;

    try {
      await apiDeleteJob(jobId);
      // remove from local state so UI updates in real-time
      setJobs((prev) => prev.filter((j) => (j._id || j.id) !== jobId));
      alert("✅ Job deleted");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete job");
    }
  }

  const [user, setUser] = useState(null);
  const [apps, setApps] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [jobFilter, setJobFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // load admin info
  useEffect(() => {
    try {
      const raw = localStorage.getItem("jb_user");
      if (raw) setUser(JSON.parse(raw));
    } catch {
      setUser(null);
    }
  }, []);

  // load applications & jobs from backend
  useEffect(() => {
    async function load() {
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
    }

    load();
  }, []);

  // aggregate stats
  const totals = useMemo(() => {
    const totalApplications = apps.length;
    const pending = apps.filter((a) =>
      (a.status || "").toLowerCase().includes("pending")
    ).length;
    const shortlisted = apps.filter((a) =>
      (a.status || "").toLowerCase().includes("shortlisted")
    ).length;
    const hired = apps.filter((a) =>
      (a.status || "").toLowerCase().includes("hired")
    ).length;

    const openJobs = jobs.length;

    return { totalApplications, pending, shortlisted, hired, openJobs };
  }, [apps, jobs]);

  // jobs with application counts (from employer applications)
  const jobWithCounts = useMemo(() => {
    const map = new Map();

    apps.forEach((app) => {
      const id =
        app.job?._id || app.jobId || app.job_id || app.job?.id || "unknown";

      const base = map.get(id) || {
        id,
        title: app.job?.title || app.jobTitle || "Job",
        company: app.job?.company || app.company || "Company",
        location: app.job?.location || app.location || "",
        type: app.job?.type || app.type || "",
        status: app.job?.status || "Open",
        count: 0,
      };

      base.count += 1;
      map.set(id, base);
    });

    // also include jobs with zero applications yet
    jobs.forEach((job) => {
      const id = job._id || job.id;
      if (!id) return;
      if (map.has(id)) return;

      map.set(id, {
        id,
        title: job.title || job.jobTitle || "Job",
        company: job.company || job.companyName || "Company",
        location: job.location || "",
        type: job.type || job.jobType || "",
        status: job.status || "Open",
        count: 0,
      });
    });

    return Array.from(map.values());
  }, [apps, jobs]);

  // flatten applications for table
  const displayApps = useMemo(
    () =>
      apps.map((a) => {
        const created =
          a.createdAt && !Number.isNaN(Date.parse(a.createdAt))
            ? new Date(a.createdAt)
            : null;
        const updated =
          a.updatedAt && !Number.isNaN(Date.parse(a.updatedAt))
            ? new Date(a.updatedAt)
            : created;

        return {
          id: a._id || a.id,
          jobTitle: a.job?.title || a.jobTitle || "Job",
          company: a.job?.company || a.company || "Company",
          candidate:
            a.candidate?.name ||
            a.applicantName ||
            a.candidateName ||
            "Candidate",
          candidateEmail:
            a.candidate?.email || a.applicantEmail || a.email || "N/A",
          status: a.status || "Pending",
          created,
          updated,
        };
      }),
    [apps]
  );

  const filteredApps = useMemo(
    () =>
      displayApps.filter((a) => {
        const matchesStatus =
          statusFilter === "All" ||
          a.status.toLowerCase() === statusFilter.toLowerCase();

        const matchesJob =
          jobFilter === "All" ||
          a.jobTitle.toLowerCase() === jobFilter.toLowerCase();

        const text = (
          a.jobTitle +
          a.company +
          a.candidate +
          a.candidateEmail
        ).toLowerCase();
        const matchesSearch = text.includes(search.toLowerCase());

        return matchesStatus && matchesJob && matchesSearch;
      }),
    [displayApps, statusFilter, jobFilter, search]
  );

  async function handleStatusChange(id, newStatus) {
    try {
      setUpdatingId(id);
      await apiUpdateStatus(id, newStatus);

      setApps((prev) =>
        prev.map((a) =>
          (a._id || a.id) === id ? { ...a, status: newStatus } : a
        )
      );
      alert(`✅ Status updated to "${newStatus}"`);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  }

  const adminName =
    user?.name || (user?.email ? user.email.split("@")[0] : "Admin");
  const adminInitial = adminName.charAt(0).toUpperCase();

  return (
    <div className="admin-dashboard">
      {/* HEADER */}
      <header className="ad-header">
        <div>
          <p className="ad-welcome">
            Welcome back, <span>{adminName}</span> 👋
          </p>
          <h1>Admin Dashboard</h1>
          <p className="ad-subtext">
            Monitor your job postings, applications and hiring pipeline in
            real-time.
          </p>
        </div>

        <div className="ad-user-pill">
          <div className="ad-avatar">{adminInitial}</div>
          <div>
            <p className="ad-user-name">{adminName}</p>
            <p className="ad-user-role">Admin • Employer</p>
          </div>
        </div>
      </header>

      {/* STATS */}
      <section className="ad-stats">
        <div className="ad-stat-card">
          <p className="ad-stat-label">Total applications</p>
          <h2>{totals.totalApplications}</h2>
          <p className="ad-stat-footer">Across all your job postings</p>
        </div>

        <div className="ad-stat-card">
          <p className="ad-stat-label">Open roles</p>
          <h2>{totals.openJobs}</h2>
          <p className="ad-stat-footer">Currently active job vacancies</p>
        </div>

        <div className="ad-stat-card">
          <p className="ad-stat-label">Shortlisted</p>
          <h2>{totals.shortlisted}</h2>
          <p className="ad-stat-footer">Candidates moved to next stage</p>
        </div>

        <div className="ad-stat-card">
          <p className="ad-stat-label">Hired</p>
          <h2>{totals.hired}</h2>
          <p className="ad-stat-footer">Successfully hired through portal</p>
        </div>
      </section>

      {/* FILTERS */}
      <section className="ad-filters">
        <div className="ad-filter-group">
          <label>Filter by job</label>
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
          >
            <option value="All">All jobs</option>
            {jobWithCounts.map((j) => (
              <option key={j.id} value={j.title}>
                {j.title}
              </option>
            ))}
          </select>
        </div>

        <div className="ad-filter-group">
          <label>Application status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview">Interview</option>
            <option value="Hired">Hired</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="ad-filter-group">
          <label>Search</label>
          <div className="ad-quick-btns">
           <input
  type="text"
  placeholder="Search by job, candidate or email"
  style={{
    flex: 1,
    padding: "0.45rem 0.6rem",
    borderRadius: "0.6rem",
    border: "1px solid #d4d4d4",   // ✅ fixed: single string
    fontSize: "0.85rem",
  }}
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>
          </div>
        </div>
      </section>

      {/* MAIN LAYOUT */}
      <section className="ad-main-layout">
        {/* LEFT COLUMN */}
        <div className="ad-column">
          {/* JOBS OVERVIEW */}
          <div className="ad-panel">
            <div className="ad-panel-header">
              <h2>Your job postings</h2>
              <span>{jobWithCounts.length} roles</span>
            </div>

            <div className="ad-job-list">
              {jobWithCounts.map((job) => (
                <div key={job.id} className="ad-job-card">
                  <div>
                    <h3>{job.title}</h3>
                    <p className="ad-job-meta">
                      {job.company}
                      {job.location && <> • {job.location}</>}
                      {job.type && <> • {job.type}</>}
                    </p>
                    <p className="ad-job-apps">
                      {job.count} application{job.count === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="ad-job-right">
                    <span
                      className={
                        "ad-badge " +
                        (job.status === "Closed" ? "ad-closed" : "ad-open")
                      }
                    >
                      {job.status || "Open"}
                    </span>
                    <button
                      type="button"
                      className="ad-btn ad-btn-outline ad-small-btn"
                      onClick={() => {
                        setJobFilter(job.title);
                      }}
                    >
                      View applications
                    </button>
                  </div>
                </div>
              ))}

              {!jobWithCounts.length && (
                <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                  No job postings found. Create a job from the “Job Post” page.
                </p>
              )}
            </div>
          </div>

          {/* APPLICATION TABLE */}
          <div className="ad-panel">
            <div className="ad-panel-header">
              <h2>Recent applications</h2>
              <span>{filteredApps.length} visible</span>
            </div>

            {loading ? (
              <p>Loading applications...</p>
            ) : filteredApps.length === 0 ? (
              <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                No applications found for the selected filters.
              </p>
            ) : (
              <div className="ad-table-wrapper">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th>Job</th>
                      <th>Candidate</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Last update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApps.map((a) => (
                      <tr key={a.id}>
                        <td>{a.jobTitle}</td>
                        <td>{a.candidate}</td>
                        <td>{a.candidateEmail}</td>
                        <td>
                          <select
                            value={a.status}
                            disabled={updatingId === a.id}
                            onChange={(e) =>
                              handleStatusChange(a.id, e.target.value)
                            }
                          >
                            <option value="Pending">Pending</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Interview">Interview</option>
                            <option value="Hired">Hired</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>
                        <td>
                          {a.updated
                            ? a.updated.toLocaleDateString()
                            : a.created
                            ? a.created.toLocaleDateString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <aside className="ad-column">
          {/* SIMPLE TEAM PANEL (UI + small animation, static demo data) */}
          <div className="ad-panel">
            <div className="ad-panel-header">
              <h2>Hiring team (demo)</h2>
              <span>3 members</span>
            </div>

            <ul className="ad-employee-list">
              <li className="ad-employee-item">
                <div className="ad-employee-avatar">K</div>
                <div className="ad-employee-info">
                  <span>Kumar Satyam</span>
                  <small>Recruiter • Tech roles</small>
                </div>
              </li>
              <li className="ad-employee-item">
                <div className="ad-employee-avatar">A</div>
                <div className="ad-employee-info">
                  <span>Anjali Verma</span>
                  <small>HR Manager</small>
                </div>
              </li>
              <li className="ad-employee-item">
                <div className="ad-employee-avatar">R</div>
                <div className="ad-employee-info">
                  <span>Rahul Singh</span>
                  <small>Engineering Lead</small>
                </div>
              </li>
            </ul>
          </div>

          {/* QUICK TODO / ACTIONS */}
          <div className="ad-panel">
            <div className="ad-panel-header">
              <h2>Quick actions</h2>
              <span>For today</span>
            </div>

            <ul className="ad-todo-list">
              <li>Review new applications for your latest posting.</li>
              <li>Shortlist top candidates and schedule interviews.</li>
              <li>Close roles that have been successfully filled.</li>
            </ul>

            <div
              style={{
                marginTop: "0.6rem",
                display: "flex",
                gap: "0.5rem",
              }}
            >
              <button
                type="button"
                className="ad-btn ad-btn-primary"
                onClick={() => {
                  window.location.href = "/post";
                }}
              >
                Post a new job
              </button>
              <button
                type="button"
                className="ad-btn ad-btn-outline"
                onClick={() => window.location.reload()}
              >
                Refresh data
              </button>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
