// src/Pages/Applications.jsx
import { useEffect, useState } from "react";
import "./Applications.css";
import { apiMyApplications } from "../api"; // ✅


const STORAGE_KEY = "jb_applications";

const DEMO_APPLICATIONS = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "Google",
    location: "Bangalore (Hybrid)",
    status: "In Review",
    appliedOn: "2025-01-10",
    updatedOn: "2025-01-15",
    type: "Full-Time",
    mode: "Hybrid",
    domain: "Software Development",
    salary: "₹12–18 LPA",
    stageNote: "Your profile is being reviewed by the hiring team.",
  },
  {
    id: 2,
    title: "Backend Engineer",
    company: "Amazon",
    location: "Remote",
    status: "Shortlisted",
    appliedOn: "2025-01-08",
    updatedOn: "2025-01-14",
    type: "Full-Time",
    mode: "Remote",
    domain: "Software Development",
    salary: "₹16–24 LPA",
    stageNote: "Shortlisted for technical interview round.",
  },
  {
    id: 3,
    title: "UI/UX Designer Intern",
    company: "Microsoft",
    location: "Hyderabad",
    status: "Applied",
    appliedOn: "2025-01-12",
    updatedOn: "2025-01-12",
    type: "Internship",
    mode: "On-site",
    domain: "UI/UX & Design",
    salary: "Stipend: ₹25,000 / month",
    stageNote: "Application submitted successfully.",
  },
  {
    id: 4,
    title: "Data Analyst",
    company: "IBM",
    location: "Pune",
    status: "Rejected",
    appliedOn: "2024-12-20",
    updatedOn: "2025-01-05",
    type: "Full-Time",
    mode: "On-site",
    domain: "Data Science / Analytics",
    salary: "₹8–12 LPA",
    stageNote: "Another candidate was selected for this role.",
  },
];

const STATUS_FILTERS = [
  "All",
  "Applied",
  "In Review",
  "Shortlisted",
  "Interview",
  "Offer",
  "Rejected",
];

export default function Applications() {
  const [applications, setApplications] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEMO_APPLICATIONS;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0)
        return DEMO_APPLICATIONS;
      return parsed;
    } catch {
      return DEMO_APPLICATIONS;
    }
  });

  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    // keep localStorage updated
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
    } catch {
      // ignore storage errors in demo
    }
  }, [applications]);

  // fetch from backend on mount
  useEffect(() => {
    apiMyApplications()
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) return;

        const mapped = data.map((app) => ({
          id: app._id || app.id,
          title: app.job?.title || app.title || "Job",
          company: app.job?.company || app.company || "Company",
          location: app.job?.location || app.location || "",
          status: app.status || "Applied",
          appliedOn: app.createdAt || app.appliedOn || "",
          updatedOn: app.updatedAt || app.updatedOn || app.createdAt || "",
          type: app.job?.type || app.type || "",
          mode: app.job?.mode || app.mode || "",
          domain: app.job?.domain || app.domain || "",
          salary: app.job?.salaryRange || app.salary || "",
          stageNote: app.note || app.stageNote || "",
        }));

        setApplications(mapped);
      })
      .catch(() => {
        // keep demo/localStorage if API fails
      });
  }, []);

  function seedDemo() {
    setApplications(DEMO_APPLICATIONS);
    alert("Demo applications loaded.");
  }

  const filteredApps = applications
    .filter((app) => {
      const matchesStatus =
        statusFilter === "All" || app.status === statusFilter;
      const text = (app.title + app.company + (app.location || "")).toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "recent") {
        return (
          new Date(b.updatedOn || b.appliedOn).getTime() -
          new Date(a.updatedOn || a.appliedOn).getTime()
        );
      }
      if (sortBy === "oldest") {
        return (
          new Date(a.appliedOn).getTime() -
          new Date(b.appliedOn).getTime()
        );
      }
      // alphabetical by title
      return a.title.localeCompare(b.title);
    });

  return (
    <div className="apps-page">
      {/* Header */}
      <header className="apps-header">
        <div>
          <h1>Application Status</h1>
          <p>
            Track all the jobs you have applied for through this job listing
            portal.
          </p>
        </div>
        <div className="apps-header-actions">
          <button
            type="button"
            className="btn-outline-small"
            onClick={seedDemo}
          >
            Load Demo Data
          </button>
        </div>
      </header>

      {/* Toolbar: search + filters + sort */}
      <div className="apps-toolbar">
        <div className="apps-search-box">
          <input
            type="text"
            placeholder="Search by job title or company."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="apps-filters">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              className={
                "apps-filter-pill" + (statusFilter === s ? " active" : "")
              }
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="apps-sort">
          <label>Sort by</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recent">Most recent update</option>
            <option value="oldest">Oldest applied</option>
            <option value="title">Job title (A–Z)</option>
          </select>
        </div>
      </div>

      {/* List */}
      <section className="apps-list">
        {filteredApps.length === 0 ? (
          <div className="apps-empty">
            <h3>No applications found</h3>
            <p>
              Once you start applying to jobs from this portal, they will show
              up here.
            </p>
          </div>
        ) : (
          filteredApps.map((app) => (
            <article key={app.id} className="app-card">
              <div className="app-main">
                <div className="app-title-row">
                  <h2>{app.title}</h2>
                  <span className={"status-badge " + statusClass(app.status)}>
                    {app.status}
                  </span>
                </div>
                <p className="app-company">
                  {app.company}
                  {app.location && <span> • {app.location}</span>}
                </p>
                <p className="app-meta">
                  {app.type && <span>{app.type}</span>}
                  {app.mode && <span>{app.mode}</span>}
                  {app.domain && <span>{app.domain}</span>}
                </p>
                {app.salary && (
                  <p className="app-salary">{app.salary}</p>
                )}
              </div>

              <div className="app-side">
                <div className="app-dates">
                  <p>
                    <strong>Applied on:</strong>{" "}
                    {formatDate(app.appliedOn)}
                  </p>
                  <p>
                    <strong>Last update:</strong>{" "}
                    {formatDate(app.updatedOn || app.appliedOn)}
                  </p>
                </div>
                <p className="app-stage-note">{app.stageNote}</p>

                <div className="app-progress-row">
                  <div className="app-progress-dots">
                    {["Applied", "In Review", "Shortlisted", "Interview", "Offer"].map(
                      (stage) => (
                        <span
                          key={stage}
                          className={
                            "progress-dot " +
                            (isStageReached(app.status, stage)
                              ? "reached"
                              : "")
                          }
                          title={stage}
                        />
                      )
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn-outline-small app-view-btn"
                  >
                    View details
                  </button>
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
    case "Applied":
      return "status-applied";
    case "In Review":
      return "status-review";
    case "Shortlisted":
      return "status-shortlisted";
    case "Interview":
      return "status-interview";
    case "Offer":
      return "status-offer";
    case "Rejected":
      return "status-rejected";
    default:
      return "";
  }
}

function isStageReached(currentStatus, stage) {
  const order = [
    "Applied",
    "In Review",
    "Shortlisted",
    "Interview",
    "Offer",
    "Rejected",
  ];
  const idxStage = order.indexOf(stage);
  const idxCurrent = order.indexOf(currentStatus);
  if (idxStage === -1 || idxCurrent === -1) return false;
  // Rejected = treat as reached all previous stages
  if (currentStatus === "Rejected") return idxStage <= 2;
  return idxCurrent >= idxStage;
}

function formatDate(str) {
  if (!str) return "N/A";
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return str;
  return d.toLocaleDateString();
}
