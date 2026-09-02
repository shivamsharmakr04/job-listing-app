// src/Pages/Jobs.jsx
import React, { useEffect, useState } from "react";
import "./Job.css";
import { apiGetJobs } from "../api";

const SAMPLE_JOBS = [
  {
    id: 1,
    title: "Senior Frontend Engineer",
    company: "Google",
    location: "Remote",
    type: "Full-Time",
    domain: "Frontend",
    experience: "3+ years",
    salary: "₹24–35 LPA",
    skills: ["React", "TypeScript", "Next.js", "TailwindCSS"],
    description: "Join Google Cloud team building next-generation web developer interfaces.",
  },
  {
    id: 2,
    title: "Lead Backend Architect",
    company: "Amazon",
    location: "Bangalore",
    type: "Full-Time",
    domain: "Backend",
    experience: "5+ years",
    salary: "₹30–45 LPA",
    skills: ["Java", "Spring Boot", "AWS", "Microservices", "Kafka"],
    description: "Architect high-throughput distributed backend services powering retail AWS platform.",
  },
  {
    id: 3,
    title: "Principal UI/UX Designer",
    company: "Microsoft",
    location: "Hyderabad",
    type: "Hybrid",
    domain: "Design",
    experience: "4+ years",
    salary: "₹22–32 LPA",
    skills: ["Figma", "Design Systems", "Prototyping", "User Research"],
    description: "Lead product design for Microsoft Teams next-gen workplace collaboration tools.",
  },
  {
    id: 4,
    title: "Full Stack AI Developer",
    company: "Netflix",
    location: "Remote",
    type: "Contract",
    domain: "Full Stack",
    experience: "3+ years",
    salary: "₹28–40 LPA",
    skills: ["Python", "FastAPI", "React", "PyTorch", "LLMs"],
    description: "Build AI-powered content personalization algorithms and media dashboards.",
  },
  {
    id: 5,
    title: "Data Science & ML Analyst",
    company: "IBM",
    location: "Pune",
    type: "Full-Time",
    domain: "Data & ML",
    experience: "1–3 years",
    salary: "₹16–22 LPA",
    skills: ["Python", "Pandas", "SQL", "Scikit-Learn", "Tableau"],
    description: "Analyze enterprise client telemetry and train predictive intelligence models.",
  },
  {
    id: 6,
    title: "Cloud & DevOps Specialist",
    company: "Oracle",
    location: "Remote",
    type: "Full-Time",
    domain: "Cloud",
    experience: "2+ years",
    salary: "₹18–26 LPA",
    skills: ["Kubernetes", "Docker", "Terraform", "CI/CD", "GCP"],
    description: "Manage scalable Kubernetes clusters and automated deployment pipelines.",
  },
];

export default function Jobs() {
  const [jobs, setJobs] = useState(SAMPLE_JOBS);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [domainFilter, setDomainFilter] = useState("All");
  const [selectedJob, setSelectedJob] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const [savedJobIds, setSavedJobIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("jb_saved_jobs")) || []; }
    catch { return []; }
  });

  useEffect(() => {
    async function loadJobs() {
      try {
        const data = await apiGetJobs();
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((job, index) => ({
            id: job._id || job.id || index + 1,
            title: job.title || "Software Engineer",
            company: job.company || "Tech Innovator",
            location: job.location || "Remote",
            type: job.type || "Full-Time",
            domain: job.domain || "Engineering",
            experience: job.experience || "2+ years",
            salary: job.salary || "₹18–25 LPA",
            skills: job.skills || ["React", "Node.js", "Cloud"],
            description: job.description || "Exciting tech role building high-impact software solutions.",
          }));
          setJobs(mapped);
        }
      } catch (err) {
        console.error("Backend fetch failed, rendering sample roles.", err);
      }
    }
    loadJobs();
  }, []);

  const toggleSaveJob = (e, jobId) => {
    e.stopPropagation();
    let updated;
    if (savedJobIds.includes(jobId)) {
      updated = savedJobIds.filter((id) => id !== jobId);
      showToast("Removed from saved jobs");
    } else {
      updated = [...savedJobIds, jobId];
      showToast("❤️ Saved job to bookmarks!");
    }
    setSavedJobIds(updated);
    localStorage.setItem("jb_saved_jobs", JSON.stringify(updated));
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      (job.skills && job.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())));

    const matchesType =
      typeFilter === "All" || job.type.toLowerCase() === typeFilter.toLowerCase();

    const matchesLocation =
      locationFilter === "All" || job.location.toLowerCase() === locationFilter.toLowerCase();

    const matchesDomain =
      domainFilter === "All" || (job.domain && job.domain.toLowerCase() === domainFilter.toLowerCase());

    return matchesSearch && matchesType && matchesLocation && matchesDomain;
  });

  return (
    <div className="jobs-page">
      {/* Toast Notification */}
      {toastMessage && <div className="jobs-toast">{toastMessage}</div>}

      {/* Header Banner */}
      <header className="jobs-hero-banner">
        <div className="jobs-hero-text">
          <div className="jobs-badge">💼 100+ Live Tech Roles</div>
          <h1>Explore Tech Opportunities</h1>
          <p>Discover top engineering, design, and AI positions from world-class tech companies.</p>
        </div>

        <div className="jobs-search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search role, company, or tech stack (e.g. React, Node)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="btn-clear-search" onClick={() => setSearch("")}>✕</button>
          )}
        </div>
      </header>

      {/* Domain Category Filter Chips */}
      <div className="domain-chips-row">
        {["All", "Frontend", "Backend", "Full Stack", "Data & ML", "Cloud", "Design"].map((dom) => (
          <button
            key={dom}
            type="button"
            className={`domain-chip ${domainFilter === dom ? "active" : ""}`}
            onClick={() => setDomainFilter(dom)}
          >
            {dom}
          </button>
        ))}
      </div>

      {/* Main Grid Layout */}
      <div className="jobs-layout">
        {/* Left Filter Sidebar */}
        <aside className="jobs-filter-card">
          <div className="filter-card-header">
            <h3>Filter Roles</h3>
            {(typeFilter !== "All" || locationFilter !== "All" || domainFilter !== "All" || search) && (
              <button
                className="btn-reset"
                onClick={() => {
                  setTypeFilter("All");
                  setLocationFilter("All");
                  setDomainFilter("All");
                  setSearch("");
                }}
              >
                Reset All
              </button>
            )}
          </div>

          <div className="filter-group">
            <label>Job Type</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="All">All Job Types</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Location</label>
            <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
              <option value="All">All Locations</option>
              <option value="Remote">Remote</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Pune">Pune</option>
              <option value="Mumbai">Mumbai</option>
            </select>
          </div>

          <div className="filter-stat-box">
            <span>Showing Results:</span>
            <strong>{filteredJobs.length} Positions</strong>
          </div>
        </aside>

        {/* Right Job Cards Section */}
        <section className="jobs-content-section">
          {filteredJobs.length === 0 ? (
            <div className="jobs-empty-card">
              <div className="empty-emoji">🔍</div>
              <h3>No roles match your search filters</h3>
              <p>Try resetting filters or searching for different tech keywords.</p>
              <button
                className="btn-primary"
                onClick={() => { setTypeFilter("All"); setLocationFilter("All"); setDomainFilter("All"); setSearch(""); }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="jobs-grid">
              {filteredJobs.map((job) => {
                const isSaved = savedJobIds.includes(job.id);
                return (
                  <article
                    key={job.id}
                    className="job-card-item"
                    onClick={() => setSelectedJob(job)}
                  >
                    <div className="card-top-row">
                      <div className="company-badge-avatar">
                        {job.company.charAt(0).toUpperCase()}
                      </div>
                      <div className="card-header-titles">
                        <h2>{job.title}</h2>
                        <p className="company-sub">{job.company} • <span className="location-pill">{job.location}</span></p>
                      </div>
                      <button
                        className={`save-bookmark-btn ${isSaved ? "saved" : ""}`}
                        onClick={(e) => toggleSaveJob(e, job.id)}
                        title={isSaved ? "Remove Bookmark" : "Save Job"}
                      >
                        {isSaved ? "❤️" : "🤍"}
                      </button>
                    </div>

                    <div className="card-tags-row">
                      <span className="type-pill">{job.type}</span>
                      <span className="salary-pill">{job.salary}</span>
                      <span className="exp-pill">{job.experience}</span>
                    </div>

                    <p className="card-desc">{job.description}</p>

                    <div className="card-skills-row">
                      {job.skills && job.skills.map((sk) => (
                        <span key={sk} className="skill-chip">{sk}</span>
                      ))}
                    </div>

                    <div className="card-actions">
                      <button className="btn-card-details">
                        View Details ➔
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Role Details Modal */}
      {selectedJob && (
        <div className="modal-backdrop" onClick={() => setSelectedJob(null)}>
          <div className="modal-glass-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedJob(null)}>✕</button>
            <div className="modal-header">
              <div className="company-badge-avatar lg">
                {selectedJob.company.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2>{selectedJob.title}</h2>
                <p>{selectedJob.company} • {selectedJob.location} • {selectedJob.salary}</p>
              </div>
            </div>

            <div className="modal-body">
              <h4>Role Description</h4>
              <p>{selectedJob.description}</p>

              <h4>Required Tech Stack</h4>
              <div className="card-skills-row">
                {selectedJob.skills && selectedJob.skills.map((s) => (
                  <span key={s} className="skill-chip lg">{s}</span>
                ))}
              </div>

              <h4>Details</h4>
              <ul className="modal-details-list">
                <li><strong>Type:</strong> {selectedJob.type}</li>
                <li><strong>Experience:</strong> {selectedJob.experience}</li>
                <li><strong>Domain:</strong> {selectedJob.domain || "Engineering"}</li>
              </ul>
            </div>

            <div className="modal-footer">
              <button
                className="btn-primary"
                onClick={() => {
                  showToast("🚀 Application submitted successfully!");
                  setSelectedJob(null);
                }}
              >
                Apply Now ⚡
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

