// src/Pages/Jobs.jsx
import { useEffect, useState } from "react";
import "./Job.css"; // ✅ correct
import { apiGetJobs } from "../api";
// ✅ correct


// Original static jobs as fallback / demo data
const SAMPLE_JOBS = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "Google",
    location: "Remote",
    type: "Full-Time",
    experience: "2+ years",
  },
  {
    id: 2,
    title: "Backend Engineer",
    company: "Amazon",
    location: "Bangalore",
    type: "Full-Time",
    experience: "3+ years",
  },
  {
    id: 3,
    title: "UI/UX Designer",
    company: "Microsoft",
    location: "Hyderabad",
    type: "Hybrid",
    experience: "1–3 years",
  },
  {
    id: 4,
    title: "React Developer",
    company: "Netflix",
    location: "Remote",
    type: "Contract",
    experience: "3+ years",
  },
  {
    id: 5,
    title: "Data Analyst",
    company: "IBM",
    location: "Pune",
    type: "Internship",
    experience: "Fresher",
  },
];

export default function Jobs() {
  const [jobs, setJobs] = useState(SAMPLE_JOBS);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");

  // Load jobs from backend (with fallback to SAMPLE_JOBS)
  useEffect(() => {
    async function loadJobs() {
      try {
        const data = await apiGetJobs(); // calls http://localhost:5000/api/jobs

        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((job, index) => ({
            id: job._id || job.id || index,
            title: job.title || "Job title",
            company: job.company || "Company",
            location: job.location || "Location",
            type: job.type || "Full-Time",
            experience: job.experience || "Experience not specified",
          }));
          setJobs(mapped);
        }
      } catch (err) {
        console.error("Failed to load jobs from backend, using sample data.", err);
        // keep SAMPLE_JOBS
      }
    }

    loadJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase());

    const matchesType =
      typeFilter === "All" ||
      job.type.toLowerCase() === typeFilter.toLowerCase();

    const matchesLocation =
      locationFilter === "All" ||
      job.location.toLowerCase() === locationFilter.toLowerCase();

    return matchesSearch && matchesType && matchesLocation;
  });

  return (
    <div className="jobs-page">
      {/* Top header + search (for jobs page only) */}
      <header className="jobs-header">
        <div>
          <h1>Jobs</h1>
          <p>Browse and filter jobs from top companies</p>
        </div>

        <div className="jobs-search-box">
          <input
            type="text"
            placeholder="Search by title or company."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="jobs-layout">
        {/* Left filter panel */}
        <aside className="jobs-filters-panel">
          <h3>Filters</h3>

          <div className="filter-group">
            <label>Job Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option>All</option>
              <option>Full-Time</option>
              <option>Contract</option>
              <option>Internship</option>
              <option>Hybrid</option>
              <option>Remote</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Location</label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option>All</option>
              <option>Remote</option>
              <option>Bangalore</option>
              <option>Hyderabad</option>
              <option>Pune</option>
            </select>
          </div>

          <p className="filter-hint">
            Tip: You can extend this with salary range, skills, and more.
          </p>
        </aside>

        {/* Right: jobs list */}
        <section className="jobs-list-section">
          {filteredJobs.length === 0 ? (
            <div className="jobs-empty">
              <p>No jobs found for selected filters.</p>
            </div>
          ) : (
            <div className="jobs-list">
              {filteredJobs.map((job) => (
                <article key={job.id} className="job-item">
                  <div className="job-main">
                    <h2>{job.title}</h2>
                    <p className="job-company">{job.company}</p>
                    <p className="job-meta">
                      <span>{job.location}</span> • <span>{job.type}</span> •{" "}
                      <span>{job.experience}</span>
                    </p>
                  </div>
                  <div className="job-actions">
                    <button className="btn-outline">Save</button>
                    <button className="btn-primary">View details</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
