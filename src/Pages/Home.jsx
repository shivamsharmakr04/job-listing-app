import React, { useState, useMemo, useEffect } from "react";
import "./Home.css";
import { apiGetJobs, apiApplyJob } from "../api"; // ✅ note: ../api

// Fallback jobs if backend fails (UI demo only)
const SAMPLE_JOBS = [
  {
    id: 1,
    title: "Senior Frontend React Developer",
    company: "TechNova Labs",
    location: "Remote • India",
    domain: "Frontend",
    type: "Full-time",
    salary: "₹12–18 LPA",
  },
  {
    id: 2,
    title: "Backend Node.js Engineer",
    company: "Cloudify Systems",
    location: "Bengaluru",
    domain: "Backend",
    type: "Full-time",
    salary: "₹15–22 LPA",
  },
  {
    id: 3,
    title: "Full Stack Developer",
    company: "InnoSoft",
    location: "Mumbai",
    domain: "Full Stack",
    type: "Full-time",
    salary: "₹10–16 LPA",
  },
];

const DOMAINS = [
  "All",
  "Frontend",
  "Backend",
  "Full Stack",
  "Data Science",
  "UI/UX",
  "Cyber Security",
  "Cloud",
  "Product",
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("All");
  const [savedJobs, setSavedJobs] = useState([]); // UI-only “Save” toggle
  const [jobs, setJobs] = useState(SAMPLE_JOBS);

  // ✅ Load jobs from backend (DB) once on mount
  useEffect(() => {
    async function load() {
      try {
        const data = await apiGetJobs(); // GET /api/jobs

        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((job, index) => ({
            id: job._id || job.id || index,
            title: job.title || job.jobTitle || "Job title",
            company: job.company || job.companyName || "Company",
            location: job.location || "",
            domain: job.domain || "Full Stack",
            type: job.type || job.jobType || "Full-time",
            salary:
              job.minSalary && job.maxSalary
                ? `${job.currency || "₹"}${job.minSalary}–${
                    job.maxSalary
                  } LPA`
                : job.salary || job.salaryRange || "Not specified",
          }));
          setJobs(mapped);
        }
      } catch (err) {
        console.error("Failed to load jobs on Home, using sample data.", err);
        // keep SAMPLE_JOBS as fallback
      }
    }

    load();
  }, []);

  // Filtered jobs for list
  const filteredJobs = useMemo(
    () =>
      jobs.filter((job) => {
        const matchSearch =
          job.title.toLowerCase().includes(search.toLowerCase()) ||
          job.company.toLowerCase().includes(search.toLowerCase());
        const matchDomain = domain === "All" || job.domain === domain;
        return matchSearch && matchDomain;
      }),
    [search, domain, jobs]
  );

  // ✅ real-time opening count from backend data
  const liveOpenings = jobs.length;

  // Save is just a UI toggle (does NOT go to localStorage or DB)
  const toggleSave = (jobId) => {
    setSavedJobs((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId]
    );
  };

  // ✅ Apply: ONLY call backend → DB, no localStorage
  const handleApply = async (job) => {
    try {
      const res = await apiApplyJob(job.id); // POST to backend

      if (res && (res._id || res.id)) {
        alert("✅ Job successfully applied!");
      } else {
        alert(
          res?.message || "Could not apply. Please check login and try again."
        );
      }
    } catch (err) {
      console.error("Error while applying for this job:", err);
      alert("❌ Error while applying for this job.");
    }
  };

  // View – keep as simple alert (you can later wire to /companies if you want)
  const handleView = (job) => {
    alert(`View details for: ${job.title}`);
  };

  return (
    <div className="home-page">
      {/* HERO AREA */}
      <section className="home-hero">
        <div className="hero-text">
          <p className="hero-kicker">Smart tech careers</p>
          <h1>
            Find the <span>right job</span> — not just the next job.
          </h1>
          <p className="hero-sub">
            Explore curated roles from top tech companies, startups and product
            teams. Save jobs, apply in one click, and track your progress.
          </p>
        </div>

        <div className="hero-visual">
          <div className="hero-orbit hero-orbit-1" />
          <div className="hero-orbit hero-orbit-2" />
          <div className="hero-card">
            {/* 🔹 Same UI, dynamic text */}
            <div className="hero-card-title">
              {liveOpenings}+ live openings
            </div>
            <div className="hero-card-sub">Updated in real-time</div>
          </div>
        </div>
      </section>

      {/* SEARCH + FILTER BAR */}
      <section className="home-toolbar">
        <form
          className="home-search"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <input
            type="text"
            placeholder="Search jobs, roles, companies."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </form>

        <div className="home-domain">
          <label htmlFor="domain-select">Domain</label>
          <select
            id="domain-select"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          >
            {DOMAINS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* JOB CARDS GRID */}
      <section className="home-jobs">
        <div className="jobs-header">
          <h2>Recommended jobs</h2>
          <p>
            Showing {filteredJobs.length}{" "}
            {domain === "All" ? "open roles" : `${domain} roles`} for you.
          </p>
        </div>

        <div className="jobs-grid">
          {filteredJobs.map((job) => (
            <article key={job.id} className="job-card">
              <header className="job-card-header">
                <h3>{job.title}</h3>
                <span className="job-domain">{job.domain}</span>
              </header>

              <div className="job-card-body">
                <div className="job-company">{job.company}</div>
                <div className="job-location">{job.location}</div>
                <div className="job-meta">
                  <span>{job.type}</span>
                  <span>{job.salary}</span>
                </div>
              </div>

              <footer className="job-card-footer">
                <button
                  type="button"
                  className="btn primary"
                  onClick={() => handleApply(job)}
                >
                  Apply
                </button>
                <button
                  type="button"
                  className={`btn secondary ${
                    savedJobs.includes(job.id) ? "saved" : ""
                  }`}
                  onClick={() => toggleSave(job.id)}
                >
                  {savedJobs.includes(job.id) ? "Saved" : "Save"}
                </button>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => handleView(job)}
                >
                  View details
                </button>
              </footer>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
