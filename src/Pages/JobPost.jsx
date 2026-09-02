// src/Pages/JobPost.jsx — Redesigned Job Posting Form with Step Sequence & Live Assistant
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./JobPost.css";
import { apiCreateJob } from "../api";

const DOMAIN_OPTIONS = [
  "Software Development",
  "Data Science / Analytics",
  "UI/UX & Design",
  "Product Management",
  "Marketing & Growth",
  "HR & Talent",
  "Finance & Operations",
  "Other",
];

const TYPE_OPTIONS = [
  "Full-Time",
  "Part-Time",
  "Internship",
  "Contract",
  "Freelance",
];

const MODE_OPTIONS = ["Remote", "Hybrid", "On-site"];

const EXPERIENCE_OPTIONS = [
  "Fresher (0 years)",
  "1–3 years",
  "3–5 years",
  "5+ years",
];

const POPULAR_SKILLS = [
  "React.js",
  "Node.js",
  "TypeScript",
  "JavaScript",
  "Python",
  "Java",
  "AWS",
  "Docker",
  "Figma",
  "MongoDB",
  "SQL",
  "Tailwind CSS",
];

export default function PostJob() {
  const navigate = useNavigate();
  const [job, setJob] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full-Time",
    domain: "Software Development",
    customDomain: "",
    mode: "Remote",
    minSalary: "",
    maxSalary: "",
    currency: "₹",
    salaryPeriod: "LPA",
    experience: "1–3 years",
    openings: "1",
    applyLink: "",
    description: "",
    responsibilities: "",
    requirements: "",
  });

  const [skillsInput, setSkillsInput] = useState("");
  const [skills, setSkills] = useState(["React.js", "Node.js", "JavaScript"]);

  function updateField(field, value) {
    setJob((prev) => ({ ...prev, [field]: value }));
  }

  function addSkill(skillToAdd) {
    const value = (skillToAdd || skillsInput).trim();
    if (!value || skills.includes(value)) return;
    setSkills((prev) => [...prev, value]);
    if (!skillToAdd) setSkillsInput("");
  }

  function handleSkillKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  }

  function removeSkill(s) {
    setSkills((prev) => prev.filter((x) => x !== s));
  }

  // Calculate completion percentage dynamically
  const getFormProgress = () => {
    let score = 0;
    if (job.title.trim()) score += 20;
    if (job.company.trim()) score += 15;
    if (job.domain) score += 15;
    if (job.location.trim()) score += 15;
    if (job.minSalary || job.maxSalary) score += 15;
    if (job.description.trim() || job.responsibilities.trim() || job.requirements.trim()) score += 10;
    if (skills.length > 0) score += 10;
    return Math.min(100, score);
  };

  const progress = getFormProgress();

  async function handleSubmit(e) {
    e.preventDefault();

    if (!job.title.trim() || !job.company.trim()) {
      alert("Please fill at least Job Title and Company.");
      return;
    }

    const effectiveDomain =
      job.domain === "Other" ? job.customDomain : job.domain;

    const payload = {
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      mode: job.mode,
      domain: effectiveDomain,
      experience: job.experience,
      openings: Number(job.openings || 1),
      description: job.description,
      responsibilities: job.responsibilities,
      requirements: job.requirements,
      applyLink: job.applyLink,
      skills,
      minSalary: Number(job.minSalary || 0),
      maxSalary: Number(job.maxSalary || 0),
      currency: job.currency,
      salaryPeriod: job.salaryPeriod,
      jobTitle: job.title,
      companyName: job.company,
      workMode: job.mode,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await apiCreateJob(payload);
      if (res && (res._id || res.id)) {
        alert("✅ Job posted successfully!");
        navigate("/admin");
      } else {
        alert("❌ Job not posted. Server did not return an ID.");
      }
    } catch (err) {
      console.error("Error posting job:", err);
      alert(`❌ Error posting job: ${err.message || "Unknown error"}`);
    }
  }

  function handleSaveDraft() {
    try {
      const existing = JSON.parse(localStorage.getItem("jb_postings") || "[]");
      existing.push({ ...job, skills, draft: true });
      localStorage.setItem("jb_postings", JSON.stringify(existing));
      alert("✅ Draft saved locally.");
    } catch {
      alert("Could not save draft.");
    }
  }

  const effectiveDomain =
    job.domain === "Other" ? (job.customDomain || "Other") : job.domain;

  return (
    <div className="postjob-page">
      {/* HEADER BANNER */}
      <header className="postjob-header">
        <div className="header-info">
          <h1>Post a New Position</h1>
          <p>Publish a high-visibility job listing to attract top candidate talent.</p>
        </div>
        <div className="postjob-actions-top">
          <button type="button" className="btn-outline-small" onClick={handleSaveDraft}>
            💾 Save Draft
          </button>
          <button type="button" className="btn-outline-small" onClick={() => navigate("/admin")}>
            📋 View Stored Jobs
          </button>
        </div>
      </header>

      {/* MAIN STEP-BY-STEP FORM */}
      <form className="postjob-form" onSubmit={handleSubmit}>
        <section className="postjob-main">
          
          {/* STEP 1: BASICS */}
          <div className="postjob-card">
            <div className="card-header">
              <span className="step-num">1</span>
              <div>
                <h2>Job Basics & Title</h2>
                <p className="hint">Set position identity, target domain, and hiring capacity.</p>
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label>Job Title <span className="req">*</span></label>
                <input
                  value={job.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  required
                />
              </div>

              <div className="field">
                <label>Company Name <span className="req">*</span></label>
                <input
                  value={job.company}
                  onChange={(e) => updateField("company", e.target.value)}
                  placeholder="e.g. Google / Acme Corp"
                  required
                />
              </div>

              <div className="field">
                <label>Primary Domain / Industry</label>
                <select
                  value={job.domain}
                  onChange={(e) => updateField("domain", e.target.value)}
                >
                  {DOMAIN_OPTIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {job.domain === "Other" && (
                <div className="field">
                  <label>Custom Domain Name</label>
                  <input
                    value={job.customDomain}
                    onChange={(e) => updateField("customDomain", e.target.value)}
                    placeholder="e.g. DevRel / Web3 / Robotics"
                  />
                </div>
              )}

              <div className="field">
                <label>Openings Count</label>
                <input
                  type="number"
                  min="1"
                  value={job.openings}
                  onChange={(e) => updateField("openings", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* STEP 2: WORK STRUCTURE */}
          <div className="postjob-card">
            <div className="card-header">
              <span className="step-num">2</span>
              <div>
                <h2>Work Structure & Experience</h2>
                <p className="hint">Define employment format, work setup, and required seniority.</p>
              </div>
            </div>

            <div className="grid-3">
              <div className="field">
                <label>Employment Type</label>
                <select
                  value={job.type}
                  onChange={(e) => updateField("type", e.target.value)}
                >
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Work Mode</label>
                <select
                  value={job.mode}
                  onChange={(e) => updateField("mode", e.target.value)}
                >
                  {MODE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Experience Level</label>
                <select
                  value={job.experience}
                  onChange={(e) => updateField("experience", e.target.value)}
                >
                  {EXPERIENCE_OPTIONS.map((exp) => (
                    <option key={exp} value={exp}>{exp}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* STEP 3: COMPENSATION & LOCATION (FIXED LAYOUT) */}
          <div className="postjob-card">
            <div className="card-header">
              <span className="step-num">3</span>
              <div>
                <h2>Compensation & Location</h2>
                <p className="hint">Specify location details and competitive salary package range.</p>
              </div>
            </div>

            <div className="field location-field">
              <label>Location (City, Country or Remote)</label>
              <input
                value={job.location}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="e.g. Bangalore, India / Remote (Global)"
              />
            </div>

            {/* SPACIOUS SALARY SECTION GRID */}
            <div className="salary-container">
              <label className="salary-container-title">Salary Package Range</label>
              
              <div className="salary-grid">
                <div className="field">
                  <label>Currency</label>
                  <select
                    value={job.currency}
                    onChange={(e) => updateField("currency", e.target.value)}
                  >
                    <option value="₹">₹ (INR)</option>
                    <option value="$">$ (USD)</option>
                    <option value="€">€ (EUR)</option>
                    <option value="£">£ (GBP)</option>
                  </select>
                </div>

                <div className="field">
                  <label>Min Salary</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 15"
                    value={job.minSalary}
                    onChange={(e) => updateField("minSalary", e.target.value)}
                  />
                </div>

                <div className="field">
                  <label>Max Salary</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 25"
                    value={job.maxSalary}
                    onChange={(e) => updateField("maxSalary", e.target.value)}
                  />
                </div>

                <div className="field">
                  <label>Pay Period</label>
                  <select
                    value={job.salaryPeriod}
                    onChange={(e) => updateField("salaryPeriod", e.target.value)}
                  >
                    <option value="LPA">LPA (Lakhs/Yr)</option>
                    <option value="Year">/ Year</option>
                    <option value="Month">/ Month</option>
                    <option value="Hour">/ Hour</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Salary Preview Badge */}
              <div className="salary-badge-preview">
                💰 Package Display: {" "}
                <strong>
                  {job.minSalary || job.maxSalary
                    ? `${job.currency}${job.minSalary || 0} – ${job.currency}${job.maxSalary || 0} ${job.salaryPeriod}`
                    : "Not specified (Negotiable)"}
                </strong>
              </div>
            </div>
          </div>

          {/* STEP 4: DESCRIPTION & RESPONSIBILITIES */}
          <div className="postjob-card">
            <div className="card-header">
              <span className="step-num">4</span>
              <div>
                <h2>Role Description & Responsibilities</h2>
                <p className="hint">Detailed scope, objectives, and qualifications required.</p>
              </div>
            </div>

            <div className="field">
              <label>Short Role Summary</label>
              <textarea
                rows={3}
                value={job.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Summarize the core mission and business impact of this role in 2–3 lines..."
              />
            </div>

            <div className="field">
              <label>Key Responsibilities</label>
              <textarea
                rows={4}
                value={job.responsibilities}
                onChange={(e) => updateField("responsibilities", e.target.value)}
                placeholder="• Build and maintain modern web applications using React.\n• Collaborate with design and backend engineers."
              />
            </div>

            <div className="field">
              <label>Requirements & Qualifications</label>
              <textarea
                rows={4}
                value={job.requirements}
                onChange={(e) => updateField("requirements", e.target.value)}
                placeholder="• 3+ years experience with JavaScript / TypeScript.\n• Strong problem-solving and system architecture skills."
              />
            </div>
          </div>

          {/* STEP 5: SKILLS & APPLICATION LINK */}
          <div className="postjob-card">
            <div className="card-header">
              <span className="step-num">5</span>
              <div>
                <h2>Skills & Application Link</h2>
                <p className="hint">Tag key technologies and define candidate application destination.</p>
              </div>
            </div>

            <div className="field">
              <label>Add Skill Tag</label>
              <div className="skills-input-row">
                <input
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="e.g. React, Node.js, AWS, Python..."
                />
                <button type="button" className="btn-secondary" onClick={() => addSkill()}>
                  + Add Skill
                </button>
              </div>
            </div>

            {/* Popular Quick-Add Pills */}
            <div className="popular-skills-section">
              <span className="popular-label">Popular Skills:</span>
              <div className="popular-chips">
                {POPULAR_SKILLS.map((ps) => {
                  const isSelected = skills.includes(ps);
                  return (
                    <button
                      key={ps}
                      type="button"
                      className={`popular-chip ${isSelected ? "selected" : ""}`}
                      onClick={() => !isSelected && addSkill(ps)}
                      disabled={isSelected}
                    >
                      {isSelected ? "✓ " : "+ "}{ps}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Active Chips */}
            {skills.length > 0 && (
              <div className="skills-chip-row">
                <label className="active-skills-label">Active Tags ({skills.length}):</label>
                <div className="chips-wrapper">
                  {skills.map((s) => (
                    <span key={s} className="skill-chip">
                      {s}
                      <button type="button" onClick={() => removeSkill(s)}>✕</button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="field app-link-field">
              <label>Application Destination (Apply Link or HR Email)</label>
              <input
                value={job.applyLink}
                onChange={(e) => updateField("applyLink", e.target.value)}
                placeholder="https://company.com/careers/job-id or hr@company.com"
              />
            </div>
          </div>
        </section>

        {/* STICKY ASSISTANT SIDEBAR */}
        <aside className="postjob-side">
          {/* COMPLETION PROGRESS TRACKER */}
          <div className="postjob-card side-card progress-card">
            <h3>Posting Progress</h3>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="progress-status-text">
              <span>{progress}% Completed</span>
              <span>{progress === 100 ? "Ready to publish!" : "In Progress"}</span>
            </div>

            <ul className="progress-checklist">
              <li className={job.title && job.company ? "done" : ""}>
                {job.title && job.company ? "✓" : "○"} Job Basics & Title
              </li>
              <li className={job.domain && job.type ? "done" : ""}>
                {job.domain && job.type ? "✓" : "○"} Work Structure
              </li>
              <li className={job.location ? "done" : ""}>
                {job.location ? "✓" : "○"} Location & Compensation
              </li>
              <li className={job.description || job.responsibilities ? "done" : ""}>
                {job.description || job.responsibilities ? "✓" : "○"} Role Description
              </li>
              <li className={skills.length > 0 ? "done" : ""}>
                {skills.length > 0 ? "✓" : "○"} Skills Tagging
              </li>
            </ul>
          </div>

          {/* LIVE CARD PREVIEW */}
          <div className="postjob-card side-card preview-card-wrapper">
            <h3>Live Card Preview</h3>
            <p className="hint">This is how candidates view your job post.</p>
            
            <div className="preview-card-box">
              <div className="preview-avatar">
                {(job.company || "C").charAt(0).toUpperCase()}
              </div>
              <div className="preview-content">
                <p className="preview-title">{job.title || "Senior Engineer Title"}</p>
                <p className="preview-company">
                  {job.company || "Company Name"} • <span className="domain-pill">{effectiveDomain}</span>
                </p>
                <p className="preview-meta">
                  📍 {job.location || "Location / Remote"} • {job.type} • {job.mode}
                </p>
                <p className="preview-salary">
                  💰 {job.minSalary || job.maxSalary
                    ? `${job.currency}${job.minSalary || 0} – ${job.currency}${job.maxSalary || 0} ${job.salaryPeriod}`
                    : "Salary Negotiable"}
                </p>
                {skills.length > 0 && (
                  <div className="preview-skills">
                    {skills.slice(0, 5).map((s) => (
                      <span key={s}>{s}</span>
                    ))}
                    {skills.length > 5 && <span className="more-skills">+{skills.length - 5} more</span>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PRO TIPS BOX */}
          <div className="postjob-card side-card tips-card">
            <h3>💡 Pro Employer Tips</h3>
            <ul className="tips-list">
              <li>Listings with transparent salary ranges get <strong>40% higher candidate engagement</strong>.</li>
              <li>Keep responsibilities to 4–6 bullet points for maximum readability.</li>
            </ul>
          </div>

          {/* FINAL PUBLISH ACTION CARD */}
          <div className="postjob-card side-card action-card">
            <h3>Publish Listing</h3>
            <p className="hint">Double-check your position details before publishing live.</p>
            <div className="postjob-actions-bottom">
              <button type="button" className="btn-outline-small" onClick={handleSaveDraft}>
                Save Draft
              </button>
              <button type="submit" className="btn-primary">
                🚀 Publish Job Now
              </button>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}

