import React, { useState, useMemo, useEffect, useCallback } from "react";
import "./Home.css";
import { apiGetJobs, apiApplyJob } from "../api";

// Fallback sample jobs
const SAMPLE_JOBS = [
  {
    id: 1,
    title: "Senior Frontend React Developer",
    company: "TechNova Labs",
    location: "Remote • India",
    domain: "Frontend",
    type: "Full-time",
    mode: "Remote",
    salary: "₹18–24 LPA",
    minSalary: 18,
    maxSalary: 24,
    description: "We are looking for a skilled React developer to build high-performance user interfaces and responsive web applications.",
    responsibilities: "• Architect scalable frontend components in React and TypeScript.\n• Optimize web application performance and cross-browser rendering.\n• Collaborate with UX design and product teams.",
    qualifications: "• 4+ years of professional frontend development experience.\n• Strong proficiency in React, TypeScript, and state management.\n• Experience with REST APIs and performance tuning.",
    benefits: "• 100% Remote flexibility\n• Health insurance for family\n• Learning stipend & conference allowances",
    skills: ["React", "TypeScript", "Redux", "TailwindCSS"],
    experience: "3-5 years",
  },
  {
    id: 2,
    title: "Backend Node.js Engineer",
    company: "Cloudify Systems",
    location: "Bengaluru, KA",
    domain: "Backend",
    type: "Full-time",
    mode: "On-site",
    salary: "₹15–22 LPA",
    minSalary: 15,
    maxSalary: 22,
    description: "Join our core backend engineering team to build scalable microservices, REST APIs, and database architecture.",
    responsibilities: "• Design and maintain high-throughput backend microservices.\n• Optimize database queries and caching layers.\n• Integrate third-party payments and security protocols.",
    qualifications: "• 3+ years experience with Node.js, Express, and MongoDB.\n• Solid understanding of database indexing and async architecture.\n• Familiarity with Docker and GCP/AWS deployments.",
    benefits: "• Competitive ESOP packages\n• Free catered lunches & fitness allowance\n• Annual team retreat",
    skills: ["Node.js", "Express", "MongoDB", "Redis", "Docker"],
    experience: "3+ years",
  },
  {
    id: 3,
    title: "Full Stack AI Engineer",
    company: "InnoSoft AI",
    location: "Mumbai / Remote",
    domain: "Full Stack",
    type: "Full-time",
    mode: "Hybrid",
    salary: "₹20–28 LPA",
    minSalary: 20,
    maxSalary: 28,
    description: "Work across the stack to build intelligent AI-powered web applications and real-time dashboard analytics.",
    responsibilities: "• Implement end-to-end user features with React and Node.js.\n• Integrate LLM APIs and vector storage mechanisms.\n• Write clean, testable code with CI/CD integration.",
    qualifications: "• Full stack proficiency with React, Node, and Python/FastAPI.\n• Experience deploying machine learning model APIs.\n• Strong problem solving and system design skill set.",
    benefits: "• Flexible hybrid working hours\n• Latest M3 MacBook Pro provided\n• Comprehensive health coverage",
    skills: ["React", "Node.js", "Python", "PostgreSQL", "OpenAI"],
    experience: "2-4 years",
  },
  {
    id: 4,
    title: "UI/UX Product Designer",
    company: "PixelCraft Studio",
    location: "Remote",
    domain: "UI/UX",
    type: "Full-time",
    mode: "Remote",
    salary: "₹12–16 LPA",
    minSalary: 12,
    maxSalary: 16,
    description: "Create sleek, intuitive, and modern web application designs, design systems, and visual micro-interactions.",
    responsibilities: "• Build user flows, wireframes, and interactive prototypes in Figma.\n• Define brand guidelines and cohesive design systems.\n• Conduct usability testing and iterate based on user metrics.",
    qualifications: "• Strong portfolio displaying modern UI design and web applications.\n• Mastery of Figma, interactive prototyping, and design systems.\n• Basic understanding of CSS/HTML layout principles.",
    benefits: "• Flexible hours\n• Design tool subscription stipends\n• Wellness allowance",
    skills: ["Figma", "Design Systems", "Prototyping", "UX Research"],
    experience: "2+ years",
  },
  {
    id: 5,
    title: "Data Scientist & ML Developer",
    company: "DataPulse Analytics",
    location: "Hyderabad",
    domain: "Data Science",
    type: "Full-time",
    mode: "Hybrid",
    salary: "₹18–25 LPA",
    minSalary: 18,
    maxSalary: 25,
    description: "Extract actionable insights from massive datasets and build predictive ML models to power business growth.",
    responsibilities: "• Develop predictive models and recommendation engines.\n• Clean, transform, and analyze complex unstructured datasets.\n• Build production pipeline pipelines in Python.",
    qualifications: "• Degree in CS, Statistics, or related quantitative field.\n• Deep knowledge of Python, pandas, scikit-learn, and PyTorch.\n• SQL expertise and experience with cloud data warehouses.",
    benefits: "• High growth environment\n• Stock options\n• Relocation allowance",
    skills: ["Python", "PyTorch", "SQL", "Pandas", "Scikit-Learn"],
    experience: "3+ years",
  },
  {
    id: 6,
    title: "Cloud & DevOps Architect",
    company: "Apex Cloud Services",
    location: "Pune • Remote",
    domain: "Cloud",
    type: "Contract",
    mode: "Remote",
    salary: "₹22–30 LPA",
    minSalary: 22,
    maxSalary: 30,
    description: "Lead infrastructure deployment, Kubernetes orchestration, and automated CI/CD pipeline development on Google Cloud.",
    responsibilities: "• Manage GCP infrastructure using Terraform.\n• Configure Kubernetes clusters and autoscaling policies.\n• Ensure zero-downtime deployments and security compliance.",
    qualifications: "• Hands-on mastery of Kubernetes, Docker, and Terraform.\n• GCP or AWS certified solutions architect.\n• Shell scripting and monitoring (Prometheus/Grafana).",
    benefits: "• High hourly rate contract\n• Remote flexibility\n• Project milestone bonuses",
    skills: ["GCP", "Kubernetes", "Docker", "Terraform", "CI/CD"],
    experience: "5+ years",
  }
];

const DOMAINS_LIST = [
  { name: "All", icon: "🌐" },
  { name: "Frontend", icon: "⚛️" },
  { name: "Backend", icon: "⚙️" },
  { name: "Full Stack", icon: "🚀" },
  { name: "Data Science", icon: "📊" },
  { name: "UI/UX", icon: "🎨" },
  { name: "Cloud", icon: "☁️" },
  { name: "Cyber Security", icon: "🛡️" },
  { name: "Product", icon: "📦" }
];

const JOB_TYPES = ["All", "Full-time", "Part-time", "Contract", "Internship", "Freelance"];

export default function Home() {
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [quickFilter, setQuickFilter] = useState("all"); // 'all', 'remote', 'high_salary', 'urgent'
  const [sortBy, setSortBy] = useState("latest"); // 'latest', 'salary'

  const [savedJobs, setSavedJobs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("jb_saved_jobs") || "[]"); }
    catch { return []; }
  });

  const [jobs, setJobs] = useState(SAMPLE_JOBS);
  const [loading, setLoading] = useState(true);

  // Job detail modal state
  const [selectedJob, setSelectedJob] = useState(null);
  const [modalTab, setModalTab] = useState("overview"); // 'overview', 'details', 'apply'
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyMsg, setApplyMsg] = useState(null); // {type: 'success'|'error', text}

  // Toast notification state
  const [toast, setToast] = useState(null); // { text, type }

  const showToast = (text, type = "info") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load jobs from backend on mount
  useEffect(() => {
    async function load() {
      try {
        const data = await apiGetJobs();
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((job) => {
            const minSal = job.minSalary || 0;
            const maxSal = job.maxSalary || 0;
            return {
              id: job._id || job.id,
              title: job.title || "Job title",
              company: job.company || "Company",
              location: job.location || "Remote",
              domain: job.domain || "Full Stack",
              type: job.type || "Full-time",
              mode: job.mode || "Remote",
              minSalary: minSal,
              maxSalary: maxSal,
              salary:
                minSal && maxSal
                  ? `${job.currency || "₹"}${minSal}–${maxSal} LPA`
                  : job.salary || "Competitive",
              description: job.description || "",
              qualifications: job.qualifications || "",
              responsibilities: job.responsibilities || "",
              benefits: job.benefits || "",
              skills: Array.isArray(job.skills) ? job.skills : [],
              experience: job.experience || "1-3 years",
              deadline: job.deadline || null,
            };
          });
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

  // Compute job counts per domain for category badges
  const domainCounts = useMemo(() => {
    const counts = { All: jobs.length };
    jobs.forEach((j) => {
      const d = j.domain || "Full Stack";
      counts[d] = (counts[d] || 0) + 1;
    });
    return counts;
  }, [jobs]);

  // Filtered and sorted jobs
  const filteredJobs = useMemo(() => {
    let result = jobs.filter((job) => {
      const query = search.toLowerCase().trim();
      const matchSearch =
        !query ||
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        (job.location || "").toLowerCase().includes(query) ||
        job.skills.some((s) => s.toLowerCase().includes(query));

      const matchDomain = domain === "All" || job.domain === domain;
      const matchType = typeFilter === "All" || job.type === typeFilter;

      // Quick filter logic
      let matchQuick = true;
      if (quickFilter === "remote") {
        matchQuick = (job.mode || "").toLowerCase().includes("remote") || (job.location || "").toLowerCase().includes("remote");
      } else if (quickFilter === "high_salary") {
        matchQuick = (job.maxSalary && job.maxSalary >= 18) || (job.salary && job.salary.includes("20"));
      } else if (quickFilter === "urgent") {
        matchQuick = job.type === "Full-time" || job.id % 2 === 0;
      }

      return matchSearch && matchDomain && matchType && matchQuick;
    });

    // Sorting
    if (sortBy === "salary") {
      result.sort((a, b) => (b.maxSalary || 0) - (a.maxSalary || 0));
    }
    return result;
  }, [search, domain, typeFilter, quickFilter, sortBy, jobs]);

  // Save / unsave toggle (persisted to localStorage)
  const toggleSave = useCallback((jobId, e) => {
    if (e) e.stopPropagation();
    setSavedJobs((prev) => {
      const isSaved = prev.includes(jobId);
      const next = isSaved
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId];
      localStorage.setItem("jb_saved_jobs", JSON.stringify(next));
      showToast(isSaved ? "Job removed from saved items" : "❤️ Job saved to bookmarks!", "success");
      return next;
    });
  }, []);

  // Share job link feature
  const handleShare = (job, e) => {
    if (e) e.stopPropagation();
    const shareText = `Check out this ${job.title} role at ${job.company}! ${window.location.origin}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      showToast("📋 Job details copied to clipboard!", "success");
    } else {
      showToast("Shareable info created!", "info");
    }
  };

  // Open job detail modal
  const handleView = (job) => {
    setSelectedJob(job);
    setModalTab("overview");
    setCoverLetter("");
    setApplyMsg(null);
  };

  // Close modal
  const closeModal = () => {
    setSelectedJob(null);
    setCoverLetter("");
    setApplyMsg(null);
  };

  // Apply from modal
  const handleApplyModal = async () => {
    if (!selectedJob) return;
    const token = localStorage.getItem("jb_token");
    if (!token) {
      setApplyMsg({ type: "error", text: "Please sign in first to submit your application." });
      return;
    }
    setApplying(true);
    setApplyMsg(null);
    try {
      const res = await apiApplyJob(selectedJob.id, coverLetter);
      if (res && (res._id || res.id)) {
        setApplyMsg({ type: "success", text: "🎉 Application submitted successfully!" });
        showToast("Application submitted successfully!", "success");
      } else {
        setApplyMsg({ type: "error", text: res?.message || "Could not apply. Please try again." });
      }
    } catch (err) {
      setApplyMsg({ type: "error", text: err.message || "Error while submitting application." });
    } finally {
      setApplying(false);
    }
  };

  // Quick apply from card
  const handleApplyQuick = async (job, e) => {
    if (e) e.stopPropagation();
    const token = localStorage.getItem("jb_token");
    if (!token) {
      showToast("Please sign in first to apply for jobs.", "warning");
      return;
    }
    try {
      const res = await apiApplyJob(job.id, "Quick application from job card.");
      if (res && (res._id || res.id)) {
        showToast(`🎉 Applied to ${job.company}!`, "success");
      } else {
        showToast(res?.message || "Could not complete quick apply.", "warning");
      }
    } catch (err) {
      showToast(err.message || "Error during quick apply.", "warning");
    }
  };

  return (
    <div className="home-page">
      {/* FLOATING TOAST NOTIFICATION */}
      {toast && (
        <div className={`toast-notification toast-${toast.type}`}>
          <span>{toast.text}</span>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="home-hero">
        <div className="hero-glow-bg" />
        <div className="hero-text">
          <div className="hero-badge-pill">
            <span className="pulse-dot" /> Live Career Portal & Job Matcher
          </div>
          <h1>
            Discover Your Next <br />
            <span className="hero-gradient-text">Dream Tech Role</span>
          </h1>
          <p className="hero-sub">
            Explore verified opportunities from top product companies & ambitious startups.
            Save roles, apply with 1-click, and supercharge your career.
          </p>

          <div className="hero-cta-group">
            <a href="#jobs-section" className="btn-hero primary">
              🚀 Explore {jobs.length}+ Jobs
            </a>
            <a href="#categories-section" className="btn-hero secondary">
              ⚡ Browse Categories
            </a>
          </div>

          <div className="hero-stats-row">
            <div className="hero-stat-item">
              <span className="stat-number">{loading ? "..." : `${jobs.length}+`}</span>
              <span className="stat-label">Active Roles</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Verified Tech Teams</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-item">
              <span className="stat-number">&lt; 24h</span>
              <span className="stat-label">Avg Response Time</span>
            </div>
          </div>
        </div>

        {/* HERO VISUAL FLOATING CARDS */}
        <div className="hero-visual">
          <div className="hero-orb orb-1" />
          <div className="hero-orb orb-2" />
          
          <div className="hero-floating-card main-card">
            <div className="card-sparkle">✨</div>
            <div className="floating-card-header">
              <div className="company-logo-avatar">TN</div>
              <div>
                <h4>Senior React Engineer</h4>
                <p className="sub-tag">TechNova • Remote</p>
              </div>
            </div>
            <div className="floating-card-badge">
              <span>₹18–24 LPA</span>
              <span className="badge-green">Instant Apply</span>
            </div>
          </div>

          <div className="hero-floating-card mini-card">
            <span className="mini-icon">🔥</span>
            <div>
              <strong>12 Jobs Added Today</strong>
              <p>Top Backend & Full Stack roles</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED CATEGORIES SECTION */}
      <section id="categories-section" className="home-categories">
        <div className="section-title-wrap">
          <h2>Popular Tech Categories</h2>
          <p>Explore opportunities grouped by developer domains</p>
        </div>
        <div className="categories-grid">
          {DOMAINS_LIST.map((item) => {
            const count = domainCounts[item.name] || 0;
            const isActive = domain === item.name;
            return (
              <button
                key={item.name}
                type="button"
                className={`category-chip ${isActive ? "active" : ""}`}
                onClick={() => {
                  setDomain(item.name);
                  document.getElementById("jobs-section")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <span className="chip-icon">{item.icon}</span>
                <span className="chip-name">{item.name}</span>
                <span className="chip-count">{count}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* MAIN TOOLBAR: SEARCH & FILTERS */}
      <section id="jobs-section" className="home-toolbar-card">
        <div className="toolbar-top">
          <div className="home-search-box">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search by job title, company, skills (e.g. React, Node, Remote)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button type="button" className="search-clear-btn" onClick={() => setSearch("")} title="Clear search">
                ✕
              </button>
            )}
          </div>

          <div className="select-group">
            <div className="custom-select-wrapper">
              <label>Domain</label>
              <select value={domain} onChange={(e) => setDomain(e.target.value)}>
                {DOMAINS_LIST.map((d) => (
                  <option key={d.name} value={d.name}>{d.icon} {d.name}</option>
                ))}
              </select>
            </div>

            <div className="custom-select-wrapper">
              <label>Type</label>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="custom-select-wrapper">
              <label>Sort By</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="latest">⚡ Newest First</option>
                <option value="salary">💰 Highest Salary</option>
              </select>
            </div>
          </div>
        </div>

        {/* QUICK FILTER CHIPS */}
        <div className="quick-filters-bar">
          <span className="quick-filter-label">Quick Filters:</span>
          <button
            type="button"
            className={`quick-pill ${quickFilter === "all" ? "active" : ""}`}
            onClick={() => setQuickFilter("all")}
          >
            All Roles ({jobs.length})
          </button>
          <button
            type="button"
            className={`quick-pill ${quickFilter === "remote" ? "active" : ""}`}
            onClick={() => setQuickFilter("remote")}
          >
            💻 Remote Jobs
          </button>
          <button
            type="button"
            className={`quick-pill ${quickFilter === "high_salary" ? "active" : ""}`}
            onClick={() => setQuickFilter("high_salary")}
          >
            🔥 High Salary (₹18L+)
          </button>
          <button
            type="button"
            className={`quick-pill ${quickFilter === "urgent" ? "active" : ""}`}
            onClick={() => setQuickFilter("urgent")}
          >
            ⚡ Fast Hiring
          </button>
        </div>
      </section>

      {/* JOB CARDS GRID SECTION */}
      <section className="home-jobs-container">
        <div className="jobs-header-meta">
          <div>
            <h3>Recommended Jobs</h3>
            <p className="jobs-count-text">
              Showing <span>{filteredJobs.length}</span> {domain === "All" ? "open roles" : `${domain} roles`} matching your criteria
            </p>
          </div>
          {(search || domain !== "All" || typeFilter !== "All" || quickFilter !== "all") && (
            <button
              type="button"
              className="btn-reset-filters"
              onClick={() => {
                setSearch("");
                setDomain("All");
                setTypeFilter("All");
                setQuickFilter("all");
              }}
            >
              Reset Filters ↺
            </button>
          )}
        </div>

        {loading ? (
          <div className="jobs-loading-skeleton">
            <div className="pulse-spinner" />
            <p>Fetching latest tech job listings...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="jobs-empty-state">
            <div className="empty-icon">🔍</div>
            <h4>No jobs found</h4>
            <p>Try clearing your search query or selecting a different domain category.</p>
            <button
              type="button"
              className="btn primary"
              onClick={() => {
                setSearch("");
                setDomain("All");
                setTypeFilter("All");
                setQuickFilter("all");
              }}
            >
              Show All Available Jobs
            </button>
          </div>
        ) : (
          <div className="jobs-grid">
            {filteredJobs.map((job) => {
              const isSaved = savedJobs.includes(job.id);
              return (
                <article
                  key={job.id}
                  className="job-card"
                  onClick={() => handleView(job)}
                >
                  <div className="job-card-top">
                    <span className="job-domain-badge">{job.domain}</span>
                    <div className="card-actions-right">
                      <button
                        type="button"
                        className="icon-action-btn"
                        title="Share job"
                        onClick={(e) => handleShare(job, e)}
                      >
                        🔗
                      </button>
                      <button
                        type="button"
                        className={`icon-action-btn ${isSaved ? "saved" : ""}`}
                        title={isSaved ? "Unsave job" : "Save job"}
                        onClick={(e) => toggleSave(job.id, e)}
                      >
                        {isSaved ? "❤️" : "🤍"}
                      </button>
                    </div>
                  </div>

                  <h3 className="job-title">{job.title}</h3>
                  <div className="job-company-name">🏢 {job.company}</div>

                  <div className="job-tags-row">
                    <span className="tag-pill location">📍 {job.location}</span>
                    <span className="tag-pill mode">🖥️ {job.mode || "Full-time"}</span>
                    <span className="tag-pill salary">💰 {job.salary}</span>
                  </div>

                  {job.skills && job.skills.length > 0 && (
                    <div className="job-skills-row">
                      {job.skills.slice(0, 4).map((s) => (
                        <span key={s} className="skill-chip">{s}</span>
                      ))}
                      {job.skills.length > 4 && (
                        <span className="skill-chip more">+{job.skills.length - 4}</span>
                      )}
                    </div>
                  )}

                  <div className="job-card-bottom">
                    <button
                      type="button"
                      className="btn-card primary"
                      onClick={(e) => handleApplyQuick(job, e)}
                    >
                      Quick Apply
                    </button>
                    <button
                      type="button"
                      className="btn-card outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(job);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* PLATFORM HIGHLIGHTS */}
      <section className="home-highlights">
        <div className="section-title-wrap text-center">
          <h2>Why Top Developers Choose Us</h2>
          <p>Designed to make tech job searching effortless, direct, and transparent</p>
        </div>

        <div className="highlights-grid">
          <div className="highlight-card">
            <div className="highlight-icon">⚡</div>
            <h3>Instant 1-Click Apply</h3>
            <p>Submit your profile directly to hiring engineering leads with no redundant forms.</p>
          </div>
          <div className="highlight-card">
            <div className="highlight-icon">🛡️</div>
            <h3>Verified Employers</h3>
            <p>All job listings are thoroughly vetted for authenticity, tech stack quality, and fair compensation.</p>
          </div>
          <div className="highlight-card">
            <div className="highlight-icon">💰</div>
            <h3>Upfront Salary Ranges</h3>
            <p>No mystery compensation. View exact salary benchmarks and equity packages before applying.</p>
          </div>
          <div className="highlight-card">
            <div className="highlight-icon">📈</div>
            <h3>Real-Time Tracking</h3>
            <p>Keep track of your submitted applications and interview progress in one simple dashboard.</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS TIMELINE */}
      <section className="how-it-works-section">
        <div className="section-title-wrap text-center">
          <h2>How It Works</h2>
          <p>Get hired in 3 simple steps</p>
        </div>

        <div className="steps-row">
          <div className="step-card">
            <div className="step-number">01</div>
            <h4>Explore & Filter</h4>
            <p>Browse curated listings by domain, remote work preferences, and desired salary range.</p>
          </div>
          <div className="step-arrow">➔</div>
          <div className="step-card">
            <div className="step-number">02</div>
            <h4>Submit Profile</h4>
            <p>Apply instantly with a single click or attach a tailored cover letter.</p>
          </div>
          <div className="step-arrow">➔</div>
          <div className="step-card">
            <div className="step-number">03</div>
            <h4>Land the Role</h4>
            <p>Connect with hiring managers and interview for your next dream role.</p>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA BANNER */}
      <section className="home-bottom-cta">
        <div className="cta-content">
          <h2>Ready to Take the Next Step in Your Career?</h2>
          <p>Join thousands of engineers and designers building modern products.</p>
          <div className="cta-buttons">
            <a href="#jobs-section" className="btn-hero primary">
              Browse Open Roles
            </a>
            <a href="/post" className="btn-hero secondary">
              Employers: Post a Job
            </a>
          </div>
        </div>
      </section>

      {/* JOB DETAIL MODAL WITH TABS */}
      {selectedJob && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal-box glass-modal" role="dialog" aria-modal="true" aria-label={selectedJob.title}>
            <button className="modal-close-btn" onClick={closeModal} aria-label="Close modal">
              ✕
            </button>

            {/* Modal Header */}
            <div className="modal-header-content">
              <div className="modal-title-row">
                <h2>{selectedJob.title}</h2>
                <span className="modal-domain-badge">{selectedJob.domain}</span>
              </div>
              <p className="modal-company-sub">
                🏢 {selectedJob.company} • 📍 {selectedJob.location}
              </p>

              <div className="modal-quick-meta">
                <span>💼 {selectedJob.type}</span>
                <span>🖥️ {selectedJob.mode || "Remote"}</span>
                <span>💰 {selectedJob.salary}</span>
                {selectedJob.experience && <span>⏱ Experience: {selectedJob.experience}</span>}
              </div>
            </div>

            {/* Modal Nav Tabs */}
            <div className="modal-tabs">
              <button
                type="button"
                className={`tab-btn ${modalTab === "overview" ? "active" : ""}`}
                onClick={() => setModalTab("overview")}
              >
                Overview
              </button>
              <button
                type="button"
                className={`tab-btn ${modalTab === "details" ? "active" : ""}`}
                onClick={() => setModalTab("details")}
              >
                Requirements & Benefits
              </button>
              <button
                type="button"
                className={`tab-btn ${modalTab === "apply" ? "active" : ""}`}
                onClick={() => setModalTab("apply")}
              >
                Apply Now
              </button>
            </div>

            {/* Modal Body Tab Content */}
            <div className="modal-body-content">
              {modalTab === "overview" && (
                <div className="tab-pane">
                  <div className="modal-section">
                    <h4>About the Role</h4>
                    <p>{selectedJob.description || "No description provided."}</p>
                  </div>

                  {selectedJob.skills && selectedJob.skills.length > 0 && (
                    <div className="modal-section">
                      <h4>Required Technologies & Skills</h4>
                      <div className="modal-skills-list">
                        {selectedJob.skills.map((s) => (
                          <span key={s} className="skill-chip highlight">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedJob.deadline && (
                    <p className="modal-deadline-tag">
                      ⏰ Application Deadline: {new Date(selectedJob.deadline).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              {modalTab === "details" && (
                <div className="tab-pane">
                  {selectedJob.responsibilities && (
                    <div className="modal-section">
                      <h4>Key Responsibilities</h4>
                      <p className="pre-text">{selectedJob.responsibilities}</p>
                    </div>
                  )}

                  {selectedJob.qualifications && (
                    <div className="modal-section">
                      <h4>Qualifications & Experience</h4>
                      <p className="pre-text">{selectedJob.qualifications}</p>
                    </div>
                  )}

                  {selectedJob.benefits && (
                    <div className="modal-section">
                      <h4>Perks & Benefits</h4>
                      <p className="pre-text">{selectedJob.benefits}</p>
                    </div>
                  )}
                </div>
              )}

              {modalTab === "apply" && (
                <div className="tab-pane">
                  <div className="modal-section">
                    <h4>Submit Application</h4>
                    <p>Optionally include a brief cover letter for the hiring team at {selectedJob.company}:</p>
                    <textarea
                      className="modal-cover-textarea"
                      rows={5}
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Introduce yourself, mention key achievements or why you are excited for this role..."
                    />
                  </div>

                  {applyMsg && (
                    <div className={`modal-apply-alert ${applyMsg.type}`}>
                      {applyMsg.text}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="modal-footer-actions">
              {modalTab !== "apply" ? (
                <button
                  type="button"
                  className="btn primary"
                  onClick={() => setModalTab("apply")}
                >
                  Proceed to Apply ➔
                </button>
              ) : (
                <button
                  type="button"
                  className="btn primary"
                  onClick={handleApplyModal}
                  disabled={applying || applyMsg?.type === "success"}
                >
                  {applying ? "Submitting..." : applyMsg?.type === "success" ? "Applied ✓" : "Submit Application"}
                </button>
              )}

              <button
                type="button"
                className={`btn secondary ${savedJobs.includes(selectedJob.id) ? "saved" : ""}`}
                onClick={(e) => toggleSave(selectedJob.id, e)}
              >
                {savedJobs.includes(selectedJob.id) ? "❤️ Saved" : "🤍 Save Job"}
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

