// src/Pages/JobDashboard.jsx
import React, { useEffect, useState } from "react";
import "./JobDashboard.css";
import { apiMyApplications, apiGetJobs, apiApplyJob } from "../api";

const SAMPLE_APPLIED = [
  {
    id: "APP-201",
    title: "Frontend Developer",
    company: "TechNova",
    location: "Bengaluru • Hybrid",
    status: "Under Review",
    appliedOn: "2025-11-20",
  },
  {
    id: "APP-202",
    title: "Backend Engineer",
    company: "CloudWorks",
    location: "Remote",
    status: "Interview Scheduled",
    appliedOn: "2025-11-18",
  },
];

const SAMPLE_RECOMMENDED = [
  {
    id: "JOB-301",
    title: "Java Developer",
    company: "InnoSoft",
    location: "Noida • Onsite",
    salary: "₹6–9 LPA",
    type: "Full Time",
    posted: "2 days ago",
    tags: ["Java", "Spring Boot", "REST APIs"],
  },
  {
    id: "JOB-302",
    title: "Data Analyst Intern",
    company: "Insight Labs",
    location: "Pune • Hybrid",
    salary: "₹15–20k / month",
    type: "Internship",
    posted: "4 days ago",
    tags: ["Excel", "SQL", "Python"],
  },
];

export default function JobDashboard() {
  const [user, setUser] = useState(null);
  const [auth, setAuth] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [recommended, setRecommended] = useState(SAMPLE_RECOMMENDED);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Load current logged in job seeker + applied jobs + recommended jobs
  useEffect(() => {
    try {
      const u = localStorage.getItem("jb_user");
      const a = localStorage.getItem("jb_auth");
      if (u) setUser(JSON.parse(u));
      if (a) setAuth(JSON.parse(a));

      const storedApplied = JSON.parse(
        localStorage.getItem("jb_applied_jobs") || "[]"
      );
      setAppliedJobs(storedApplied.length ? storedApplied : SAMPLE_APPLIED);
    } catch {
      setUser(null);
      setAuth(null);
      setAppliedJobs(SAMPLE_APPLIED);
    }

    // fetch real applications
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
        }));

        setAppliedJobs(mapped);
        try {
          localStorage.setItem("jb_applied_jobs", JSON.stringify(mapped));
        } catch {
          // ignore
        }
      })
      .catch(() => {
        // keep demo/localStorage data
      });

    // fetch recommended/open jobs from backend
    apiGetJobs()
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) return;

        const mapped = data.slice(0, 5).map((job, index) => {
          const created =
            job.createdAt && !Number.isNaN(Date.parse(job.createdAt))
              ? new Date(job.createdAt)
              : null;

          return {
            id: job._id || job.id || index,
            backendId: job._id || job.id || index,
            title: job.title || job.jobTitle || "Job",
            company: job.company || job.companyName || "Company",
            location: job.location || "",
            type: job.type || job.jobType || "Full-Time",
            salary:
              job.minSalary && job.maxSalary
                ? `${job.currency || "₹"}${job.minSalary}–${job.maxSalary} ${
                    job.salaryPeriod || "Year"
                  }`
                : job.salaryRange || job.salary || "Not specified",
            posted: created ? created.toLocaleDateString() : "Just now",
            tags: Array.isArray(job.skills) && job.skills.length
              ? job.skills.slice(0, 4)
              : [job.domain || job.type || "Open role"].filter(Boolean),
          };
        });

        setRecommended(mapped);
      })
      .catch(() => {
        // keep SAMPLE_RECOMMENDED
      });
  }, []);

  const seekerName =
    user?.name || (user?.email ? user.email.split("@")[0] : "Job Seeker");

  // derived stats
  const totalApplied = appliedJobs.length;
  const inProcess = appliedJobs.filter(
    (j) =>
      j.status === "Under Review" ||
      j.status === "Interview Scheduled" ||
      j.status === "Shortlisted"
  ).length;
  const offersCount = appliedJobs.filter(
    (j) => j.status === "Offer Received"
  ).length;

  const profileCompletion = 75; // demo

  // filter on status for "Your applications"
  const filteredApplications = appliedJobs.filter((job) => {
    if (filterStatus === "all") return true;
    return job.status.toLowerCase() === filterStatus;
  });

  // also apply search
  const finalApplications = filteredApplications.filter((job) => {
    const text = (job.title + job.company + (job.location || "")).toLowerCase();
    return text.includes(search.toLowerCase());
  });

  async function handleApplyRecommended(job) {
    try {
      const idToSend = job.backendId || job.id;
      const res = await apiApplyJob(idToSend);

      if (res && res._id) {
        alert(`Applied to: ${job.title}`);

        // Optimistically add into "Your applications"
        setAppliedJobs((prev) => [
          {
            id: res._id,
            title: job.title,
            company: job.company,
            location: job.location,
            status: "Applied",
            appliedOn: new Date().toISOString(),
          },
          ...prev,
        ]);
      } else {
        alert("Could not apply. Please check login and try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error while applying for this job.");
    }
  }

  return (
    <div className="job-dashboard">
      {/* Header */}
      <header className="jd-header">
        <div>
          <p className="jd-welcome">
            Welcome back, <span>{seekerName}</span> 👋
          </p>
          <h1>Job Seeker Dashboard</h1>
          <p className="jd-subtext">
            Track the jobs you&apos;ve applied to and keep your profile updated
            to get better matches.
          </p>
        </div>

        <div className="jd-user-pill">
          <div className="jd-avatar">
            {seekerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="jd-user-name">{seekerName}</p>
            <p className="jd-user-role">
              {auth?.role === "admin" ? "Employer" : "Job Seeker"}
            </p>
          </div>
        </div>
      </header>

      {/* Stats */}
      <section className="jd-stats">
        <div className="jd-stat-card">
          <p className="jd-stat-label">Total applications</p>
          <h2>{totalApplied}</h2>
          <p className="jd-stat-footer">
            Jobs you&apos;ve applied to from this portal
          </p>
        </div>
        <div className="jd-stat-card">
          <p className="jd-stat-label">In progress</p>
          <h2>{inProcess}</h2>
          <p className="jd-stat-footer">Under review or interview stage</p>
        </div>
        <div className="jd-stat-card">
          <p className="jd-stat-label">Offers</p>
          <h2>{offersCount}</h2>
          <p className="jd-stat-footer">Offer received / accepted</p>
        </div>
        <div className="jd-stat-card">
          <p className="jd-stat-label">Profile completeness</p>
          <h2>{profileCompletion}%</h2>
          <p className="jd-stat-footer">Add skills, education &amp; resume</p>
        </div>
      </section>

      {/* Filters */}
      <section className="jd-filters">
        <div className="jd-search">
          <label>Search in your applications</label>
          <input
            type="text"
            placeholder="Search by job title, company."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="jd-search">
          <label>Application status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="under review">Under Review</option>
            <option value="interview scheduled">Interview Scheduled</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="offer received">Offer Received</option>
          </select>
        </div>

        <div className="jd-search">
          <label>Quick action</label>
          <button
            type="button"
            className="jd-btn jd-btn-primary"
            onClick={() => {
              alert("Profile edit coming soon (demo).");
            }}
          >
            Edit profile
          </button>
        </div>
      </section>

      {/* Main layout */}
      <section className="jd-main-layout">
        {/* LEFT: Your applications + recommended jobs */}
        <div className="jd-col-main">
          <div className="jd-applications-card">
            <div className="jd-app-header">
              <h2>Your applications</h2>
              <p>{finalApplications.length} active</p>
            </div>

            {finalApplications.length === 0 ? (
              <p className="jd-empty">
                No applications found. Start applying from the Jobs page.
              </p>
            ) : (
              finalApplications.map((job) => (
                <article key={job.id} className="jd-app-card">
                  <div className="jd-app-main">
                    <h3>{job.title}</h3>
                    <p className="jd-company">
                      <span>{job.company}</span>
                      {job.location && <> • {job.location}</>}
                    </p>
                    <p className="jd-meta">
                      Applied on{" "}
                      {job.appliedOn
                        ? new Date(job.appliedOn).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  <div className="jd-app-side">
                    <span className={"jd-status-badge"}>
                      {job.status || "Applied"}
                    </span>
                    <button className="jd-btn jd-btn-outline">
                      View details
                    </button>
                    <button className="jd-btn jd-btn-primary">
                      Update status (demo)
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Recommended jobs – NOW live from backend */}
          <div className="jd-job-list" style={{ marginTop: "1.25rem" }}>
            <div className="jd-job-list-header">
              <h2>Recommended for you</h2>
              <p>{recommended.length} matches based on your profile</p>
            </div>

            {recommended.map((job) => (
              <article key={job.id} className="jd-job-card">
                <div className="jd-job-main">
                  <h3>{job.title}</h3>
                  <p className="jd-company">
                    <span>{job.company}</span> • {job.location}
                  </p>
                  <p className="jd-meta">
                    {job.type} • Posted {job.posted}
                  </p>
                  <p className="jd-salary">{job.salary}</p>
                  <div className="jd-tags">
                    {job.tags?.map((t) => (
                      <span key={t} className="jd-tag">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="jd-job-actions">
                  <p className="jd-posted">{job.posted}</p>
                  <button
                    className="jd-btn jd-btn-primary"
                    type="button"
                    onClick={() => handleApplyRecommended(job)}
                  >
                    Apply now
                  </button>
                  <button
                    className="jd-btn jd-btn-outline"
                    type="button"
                    onClick={() => alert("Saved for later (demo).")}
                  >
                    Save for later
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN – Profile & tips (unchanged UI) */}
        <aside className="jd-sidebar">
          <div className="jd-side-card">
            <h3>Profile overview</h3>
            <ul>
              <li>
                <span>Profile completeness</span>
                <span>{profileCompletion}%</span>
              </li>
              <li>
                <span>Resume uploaded</span>
                <span>Yes (demo)</span>
              </li>
              <li>
                <span>Skills added</span>
                <span>React, JavaScript, SQL</span>
              </li>
            </ul>
            <button className="jd-btn jd-btn-primary">Edit profile</button>
          </div>

          <div className="jd-side-card">
            <h3>Tips for faster hiring</h3>
            <ul className="jd-tips-list">
              <li>Keep your profile updated with latest skills.</li>
              <li>Apply only to roles that match your experience.</li>
              <li>Enable notifications to never miss updates.</li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}
