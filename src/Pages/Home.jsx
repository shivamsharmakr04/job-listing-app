import React, { useState, useMemo, useEffect, useCallback } from "react";
import "./Home.css";
import { apiGetJobs, apiApplyJob } from "../api";

// Fallback jobs if backend is unavailable
const SAMPLE_JOBS = [
  {
    id: 1,
    title: "Senior Frontend React Developer",
    company: "TechNova Labs",
    location: "Remote • India",
    domain: "Frontend",
    type: "Full-time",
    mode: "Remote",
    salary: "₹12–18 LPA",
    description: "We are looking for a skilled React developer to join our team.",
    skills: ["React", "TypeScript", "Redux"],
  },
  {
    id: 2,
    title: "Backend Node.js Engineer",
    company: "Cloudify Systems",
    location: "Bengaluru",
    domain: "Backend",
    type: "Full-time",
    mode: "On-site",
    salary: "₹15–22 LPA",
    description: "Join our backend team to build scalable APIs.",
    skills: ["Node.js", "Express", "MongoDB"],
  },
  {
    id: 3,
    title: "Full Stack Developer",
    company: "InnoSoft",
    location: "Mumbai",
    domain: "Full Stack",
    type: "Full-time",
    mode: "Hybrid",
    salary: "₹10–16 LPA",
    description: "Work on both frontend and backend of our product.",
    skills: ["React", "Node.js", "PostgreSQL"],
  },
];

const DOMAINS = [
  "All", "Frontend", "Backend", "Full Stack",
  "Data Science", "UI/UX", "Cyber Security", "Cloud", "Product",
];

const JOB_TYPES = ["All", "Full-time", "Part-time", "Contract", "Internship", "Freelance"];

export default function Home() {
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [savedJobs, setSavedJobs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("jb_saved_jobs") || "[]"); }
    catch { return []; }
  });
  const [jobs, setJobs] = useState(SAMPLE_JOBS);
  const [loading, setLoading] = useState(true);

  // Job detail modal state
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyMsg, setApplyMsg] = useState(null); // {type: 'success'|'error', text}

  // Load jobs from backend on mount
  useEffect(() => {
    async function load() {
      try {
        const data = await apiGetJobs();
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((job) => ({
            id: job._id || job.id,
            title: job.title || "Job title",
            company: job.company || "Company",
            location: job.location || "",
            domain: job.domain || "Full Stack",
            type: job.type || "Full-time",
            mode: job.mode || "",
            salary:
              job.minSalary && job.maxSalary
                ? `${job.currency || "₹"}${job.minSalary}–${job.maxSalary} LPA`
                : "Not specified",
            description: job.description || "",
            qualifications: job.qualifications || "",
            responsibilities: job.responsibilities || "",
            benefits: job.benefits || "",
            skills: Array.isArray(job.skills) ? job.skills : [],
            experience: job.experience || "",
            deadline: job.deadline || null,
          }));
          setJobs(mapped);
        }
      } catch (err) {
        console.warn("Backend unavailable, using sample data:", err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Filtered jobs
  const filteredJobs = useMemo(() =>
    jobs.filter((job) => {
      const matchSearch =
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.company.toLowerCase().includes(search.toLowerCase()) ||
        (job.location || "").toLowerCase().includes(search.toLowerCase());
      const matchDomain = domain === "All" || job.domain === domain;
      const matchType = typeFilter === "All" || job.type === typeFilter;
      return matchSearch && matchDomain && matchType;
    }),
    [search, domain, typeFilter, jobs]
  );

  // Save / unsave toggle (persisted to localStorage)
  const toggleSave = useCallback((jobId) => {
    setSavedJobs((prev) => {
      const next = prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId];
      localStorage.setItem("jb_saved_jobs", JSON.stringify(next));
      return next;
    });
  }, []);

  // Open job detail modal
  const handleView = (job) => {
    setSelectedJob(job);
    setCoverLetter("");
    setApplyMsg(null);
  };

  // Close modal
  const closeModal = () => {
    setSelectedJob(null);
    setCoverLetter("");
    setApplyMsg(null);
  };

  // Apply from modal (with cover letter)
  const handleApplyModal = async () => {
    if (!selectedJob) return;
    const token = localStorage.getItem("jb_token");
    if (!token) {
      setApplyMsg({ type: "error", text: "Please sign in first to apply." });
      return;
    }
    setApplying(true);
    setApplyMsg(null);
    try {
      const res = await apiApplyJob(selectedJob.id, coverLetter);
      if (res && (res._id || res.id)) {
        setApplyMsg({ type: "success", text: "✅ Application submitted successfully!" });
      } else {
        setApplyMsg({ type: "error", text: res?.message || "Could not apply. Try again." });
      }
    } catch (err) {
      setApplyMsg({ type: "error", text: err.message || "Error while applying." });
    } finally {
      setApplying(false);
    }
  };

  // Quick apply (from card, no cover letter)
  const handleApply = async (job) => {
    const token = localStorage.getItem("jb_token");
    if (!token) {
      alert("Please sign in first to apply for a job.");
      return;
    }
    try {
      const res = await apiApplyJob(job.id, "");
      if (res && (res._id || res.id)) {
        alert("✅ Application submitted successfully!");
      } else {
        alert(res?.message || "Could not apply. Please check login and try again.");
      }
    } catch (err) {
      alert(err.message || "Error while applying for this job.");
    }
  };

  const liveOpenings = jobs.length;

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
            <div className="hero-card-title">
              {loading ? "..." : `${liveOpenings}+`} live openings
            </div>
            <div className="hero-card-sub">Updated in real-time</div>
          </div>
        </div>
      </section>

      {/* SEARCH + FILTER BAR */}
      <section className="home-toolbar">
        <form
          className="home-search"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="text"
            placeholder="Search jobs, roles, companies, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" aria-label="Search">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="home-domain">
          <label htmlFor="type-select">Type</label>
          <select
            id="type-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            {JOB_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
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

        {loading ? (
          <div className="jobs-loading">
            <div className="spinner" />
            <p>Loading jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="jobs-empty">
            <p>No jobs found matching your filters. Try adjusting your search.</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {filteredJobs.map((job) => (
              <article key={job.id} className="job-card">
                <header className="job-card-header">
                  <h3>{job.title}</h3>
                  <span className="job-domain">{job.domain}</span>
                </header>

                <div className="job-card-body">
                  <div className="job-company">{job.company}</div>
                  <div className="job-location">📍 {job.location}</div>
                  <div className="job-meta">
                    <span>💼 {job.type}</span>
                    {job.mode && <span>🏢 {job.mode}</span>}
                    <span>💰 {job.salary}</span>
                  </div>
                  {job.skills && job.skills.length > 0 && (
                    <div className="job-skills-preview">
                      {job.skills.slice(0, 3).map((s) => (
                        <span key={s} className="skill-tag">{s}</span>
                      ))}
                      {job.skills.length > 3 && (
                        <span className="skill-tag more">+{job.skills.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>

                <footer className="job-card-footer">
                  <button
                    type="button"
                    className="btn primary"
                    onClick={() => handleApply(job)}
                  >
                    Quick Apply
                  </button>
                  <button
                    type="button"
                    className={`btn secondary ${savedJobs.includes(job.id) ? "saved" : ""}`}
                    onClick={() => toggleSave(job.id)}
                  >
                    {savedJobs.includes(job.id) ? "✓ Saved" : "Save"}
                  </button>
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => handleView(job)}
                  >
                    View Details
                  </button>
                </footer>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* JOB DETAIL MODAL */}
      {selectedJob && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal-box" role="dialog" aria-modal="true" aria-label={selectedJob.title}>
            <button className="modal-close" onClick={closeModal} aria-label="Close">✕</button>

            <div className="modal-header">
              <h2>{selectedJob.title}</h2>
              <span className="job-domain">{selectedJob.domain}</span>
            </div>

            <div className="modal-meta">
              <span>🏢 {selectedJob.company}</span>
              <span>📍 {selectedJob.location}</span>
              <span>💼 {selectedJob.type}</span>
              {selectedJob.mode && <span>🖥️ {selectedJob.mode}</span>}
              <span>💰 {selectedJob.salary}</span>
              {selectedJob.experience && <span>⏱ {selectedJob.experience}</span>}
            </div>

            {selectedJob.skills && selectedJob.skills.length > 0 && (
              <div className="modal-skills">
                {selectedJob.skills.map((s) => (
                  <span key={s} className="skill-tag">{s}</span>
                ))}
              </div>
            )}

            {selectedJob.description && (
              <div className="modal-section">
                <h3>About the role</h3>
                <p>{selectedJob.description}</p>
              </div>
            )}

            {selectedJob.responsibilities && (
              <div className="modal-section">
                <h3>Responsibilities</h3>
                <p style={{ whiteSpace: "pre-line" }}>{selectedJob.responsibilities}</p>
              </div>
            )}

            {selectedJob.qualifications && (
              <div className="modal-section">
                <h3>Qualifications</h3>
                <p style={{ whiteSpace: "pre-line" }}>{selectedJob.qualifications}</p>
              </div>
            )}

            {selectedJob.benefits && (
              <div className="modal-section">
                <h3>Benefits</h3>
                <p style={{ whiteSpace: "pre-line" }}>{selectedJob.benefits}</p>
              </div>
            )}

            {selectedJob.deadline && (
              <p className="modal-deadline">
                ⏰ Application deadline: {new Date(selectedJob.deadline).toLocaleDateString()}
              </p>
            )}

            {/* Cover Letter */}
            <div className="modal-section">
              <h3>Cover Letter <span style={{ fontWeight: 400, fontSize: "0.85rem" }}>(optional)</span></h3>
              <textarea
                className="modal-textarea"
                rows={4}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tell the employer why you're a great fit for this role..."
              />
            </div>

            {applyMsg && (
              <div className={`apply-msg ${applyMsg.type}`}>
                {applyMsg.text}
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="btn primary"
                onClick={handleApplyModal}
                disabled={applying || applyMsg?.type === "success"}
              >
                {applying ? "Submitting..." : applyMsg?.type === "success" ? "Applied ✓" : "Apply Now"}
              </button>
              <button
                type="button"
                className={`btn secondary ${savedJobs.includes(selectedJob.id) ? "saved" : ""}`}
                onClick={() => toggleSave(selectedJob.id)}
              >
                {savedJobs.includes(selectedJob.id) ? "✓ Saved" : "Save Job"}
              </button>
              <button type="button" className="btn ghost" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
