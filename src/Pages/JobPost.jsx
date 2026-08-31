// src/Pages/JobPost.jsx
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
  "HR / Talent",
  "Finance",
  "Other",
];

const TYPE_OPTIONS = [
  "Full-Time",
  "Part-Time",
  "Internship",
  "Contract",
  "Freelance",
];

const MODE_OPTIONS = ["On-site", "Remote", "Hybrid"];
const EXPERIENCE_OPTIONS = [
  "Fresher",
  "0–1 years",
  "1–3 years",
  "3–5 years",
  "5+ years",
];

export default function PostJob() {
  const navigate = useNavigate();
  const [job, setJob] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full-Time",
    domain: "",
    customDomain: "",
    mode: "On-site",
    minSalary: "",
    maxSalary: "",
    currency: "₹",
    salaryPeriod: "Year",
    experience: "",
    openings: "1",
    applyLink: "",
    description: "",
    responsibilities: "",
    requirements: "",
  });

  const [skillsInput, setSkillsInput] = useState("");
  const [skills, setSkills] = useState([]);

  function updateField(field, value) {
    setJob((prev) => ({ ...prev, [field]: value }));
  }

  function addSkill() {
    const value = skillsInput.trim();
    if (!value) return;
    if (skills.includes(value)) return;
    setSkills((prev) => [...prev, value]);
    setSkillsInput("");
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

  async function handleSubmit(e) {
    e.preventDefault();

    if (!job.title.trim() || !job.company.trim()) {
      alert("Please fill at least Job Title and Company.");
      return;
    }

    const effectiveDomain =
      job.domain === "Other" ? job.customDomain : job.domain;

    const payload = {
      // main fields
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

      // salary fields
      minSalary: Number(job.minSalary || 0),
      maxSalary: Number(job.maxSalary || 0),
      currency: job.currency,
      salaryPeriod: job.salaryPeriod,

      // common backend names
      jobTitle: job.title,
      companyName: job.company,
      workMode: job.mode,

      createdAt: new Date().toISOString(),
    };

    console.log("Posting job payload:", payload);

    try {
      const res = await apiCreateJob(payload);

      console.log("Job created response:", res);

      if (res && (res._id || res.id)) {
        alert("✅ Job posted successfully");
        // Reset form
        setJob({
          title: "", company: "", location: "",
          type: "Full-Time", domain: "", customDomain: "",
          mode: "On-site", minSalary: "", maxSalary: "",
          currency: "₹", salaryPeriod: "Year", experience: "",
          openings: "1", applyLink: "", description: "",
          responsibilities: "", requirements: "",
        });
        setSkills([]);
        setSkillsInput("");
        // Redirect to admin dashboard
        navigate("/admin");

        // Optional: also cache in localStorage so other pages can use as fallback
        try {
          const existing = JSON.parse(
            localStorage.getItem("jb_jobs_cache") || "[]"
          );
          const newJob = {
            id: res._id || res.id,
            ...payload,
          };
          localStorage.setItem(
            "jb_jobs_cache",
            JSON.stringify([newJob, ...existing])
          );
        } catch {
          // ignore cache errors
        }
      } else {
        alert("❌ Job not posted. Backend did not return an ID.");
      }
    } catch (err) {
      console.error("Error posting job:", err);
      alert(`❌ Error posting job: ${err.message || "Unknown error"}`);
    }
  }

  function handleSaveDraft() {
    const payload = {
      ...job,
      skills,
      draft: true,
      createdAt: new Date().toISOString(),
    };
    try {
      const existing = JSON.parse(localStorage.getItem("jb_postings") || "[]");
      existing.push(payload);
      localStorage.setItem("jb_postings", JSON.stringify(existing));
      alert("Draft saved (demo).");
    } catch {
      alert("Could not save draft (localStorage error).");
    }
  }

  const effectiveDomain =
    job.domain === "Other" ? job.customDomain : job.domain;

  return (
    <div className="postjob-page">
      <header className="postjob-header">
        <div>
          <h1>Post a Job</h1>
          <p>Create a new job listing for any role, domain, and salary range.</p>
        </div>
        <div className="postjob-actions-top">
          <button
            type="button"
            className="btn-outline-small"
            onClick={handleSaveDraft}
          >
            Save Draft
          </button>
          <button
            type="button"
            className="btn-outline-small"
            onClick={() => {
              const stored = localStorage.getItem("jb_postings");
              console.log("Current postings:", stored);
              alert("Check console for stored postings (demo).");
            }}
          >
            View Stored Jobs
          </button>
        </div>
      </header>

      {/* 🔽 All original UI kept the same */}
      <form className="postjob-form" onSubmit={handleSubmit}>
        {/* LEFT MAIN FORM */}
        <section className="postjob-main">
          {/* Job basics */}
          <div className="postjob-card">
            <h2>Job Basics</h2>
            <p className="hint">
              Start with the core details of the position you are hiring for.
            </p>

            <div className="grid-2">
              <div className="field">
                <label>
                  Job Title <span className="req">*</span>
                </label>
                <input
                  value={job.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="e.g. Frontend Developer"
                />
              </div>

              <div className="field">
                <label>
                  Company <span className="req">*</span>
                </label>
                <input
                  value={job.company}
                  onChange={(e) => updateField("company", e.target.value)}
                  placeholder="e.g. Google"
                />
              </div>

              <div className="field">
                <label>Location</label>
                <input
                  value={job.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="e.g. Bangalore / Remote"
                />
              </div>

              <div className="field">
                <label>Number of Openings</label>
                <input
                  type="number"
                  min="1"
                  value={job.openings}
                  onChange={(e) => updateField("openings", e.target.value)}
                />
              </div>

              <div className="field">
                <label>Job Type</label>
                <select
                  value={job.type}
                  onChange={(e) => updateField("type", e.target.value)}
                >
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt}>{opt}</option>
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
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Domain, Experience, Salary */}
          <div className="postjob-card">
            <h2>Domain, Experience & Salary</h2>
            <p className="hint">
              Specify domain, experience band and compensation range.
            </p>

            <div className="grid-2">
              <div className="field">
                <label>Domain</label>
                <select
                  value={job.domain}
                  onChange={(e) => updateField("domain", e.target.value)}
                >
                  <option value="">Select domain</option>
                  {DOMAIN_OPTIONS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>

              {job.domain === "Other" && (
                <div className="field">
                  <label>Custom Domain</label>
                  <input
                    value={job.customDomain}
                    onChange={(e) =>
                      updateField("customDomain", e.target.value)
                    }
                    placeholder="e.g. Blockchain, DevRel"
                  />
                </div>
              )}

              <div className="field">
                <label>Experience Level</label>
                <select
                  value={job.experience}
                  onChange={(e) => updateField("experience", e.target.value)}
                >
                  <option value="">Select experience</option>
                  {EXPERIENCE_OPTIONS.map((e) => (
                    <option key={e}>{e}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Salary Range</label>
                <div className="salary-row">
                  <select
                    value={job.currency}
                    onChange={(e) => updateField("currency", e.target.value)}
                  >
                    <option value="₹">₹</option>
                    <option value="$">$</option>
                    <option value="€">€</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={job.minSalary}
                    onChange={(e) =>
                      updateField("minSalary", e.target.value)
                    }
                  />
                  <span className="salary-sep">–</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={job.maxSalary}
                    onChange={(e) =>
                      updateField("maxSalary", e.target.value)
                    }
                  />
                  <select
                    value={job.salaryPeriod}
                    onChange={(e) =>
                      updateField("salaryPeriod", e.target.value)
                    }
                  >
                    <option value="Year">/Year</option>
                    <option value="Month">/Month</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Description & Responsibilities */}
          <div className="postjob-card">
            <h2>Role Description</h2>
            <p className="hint">
              Describe the role, responsibilities and required qualifications.
            </p>

            <div className="field">
              <label>Short Description</label>
              <textarea
                rows={3}
                value={job.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Summarize the role in 2–3 lines."
              />
            </div>

            <div className="field">
              <label>Key Responsibilities</label>
              <textarea
                rows={4}
                value={job.responsibilities}
                onChange={(e) =>
                  updateField("responsibilities", e.target.value)
                }
                placeholder="- Build and maintain features.
- Collaborate with cross-functional teams."
              />
            </div>

            <div className="field">
              <label>Requirements / Qualifications</label>
              <textarea
                rows={4}
                value={job.requirements}
                onChange={(e) => updateField("requirements", e.target.value)}
                placeholder="- 2+ years in React.
- Strong problem solving skills."
              />
            </div>
          </div>

          {/* Skills */}
          <div className="postjob-card">
            <h2>Skills</h2>
            <p className="hint">
              Add the skills that are important for this role.
            </p>

            <div className="field">
              <label>Add Skill</label>
              <div className="skills-input-row">
                <input
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="e.g. React, Node.js, SQL"
                />
                <button
                  type="button"
                  className="btn-primary"
                  onClick={addSkill}
                >
                  Add
                </button>
              </div>
            </div>

            <div className="skills-chip-row">
              {skills.map((s) => (
                <span key={s} className="skill-chip">
                  {s}
                  <button type="button" onClick={() => removeSkill(s)}>
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* RIGHT SUMMARY / APPLY DETAILS */}
        <aside className="postjob-side">
          <div className="postjob-card side-card">
            <h3>Apply Details</h3>
            <p className="hint">
              Where should candidates apply or contact you?
            </p>
            <div className="field">
              <label>Application Link / Email</label>
              <input
                value={job.applyLink}
                onChange={(e) => updateField("applyLink", e.target.value)}
                placeholder="e.g. https://company.com/jobs/123 or hr@company.com"
              />
            </div>
          </div>

          <div className="postjob-card side-card">
            <h3>Preview</h3>
            <p className="preview-title">
              {job.title || "Job Title not set"}
            </p>
            <p className="preview-company">
              {job.company || "Company name"}
              {effectiveDomain && ` • ${effectiveDomain}`}
            </p>
            <p className="preview-meta">
              {(job.location || "Location not set") +
                (job.type ? ` • ${job.type}` : "") +
                (job.mode ? ` • ${job.mode}` : "")}
            </p>
            {job.minSalary && job.maxSalary && (
              <p className="preview-salary">
                Estimated: {job.currency}
                {job.minSalary} – {job.maxSalary} / {job.salaryPeriod}
              </p>
            )}
            {skills.length > 0 && (
              <div className="preview-skills">
                {skills.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
            )}
          </div>

          <div className="postjob-card side-card">
            <h3>Actions</h3>
            <div className="postjob-actions-bottom">
              <button
                type="button"
                className="btn-outline-small"
                onClick={handleSaveDraft}
              >
                Save Draft
              </button>
              <button type="submit" className="btn-primary">
                Post Job
              </button>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
