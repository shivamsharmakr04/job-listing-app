// src/Pages/JobPost.jsx — Pristine step-by-step job posting form
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
    salaryPeriod: "Year",
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

  function addSkill() {
    const value = skillsInput.trim();
    if (!value || skills.includes(value)) return;
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
    job.domain === "Other" ? job.customDomain : job.domain;

  return (
    <div className="postjob-page">
      {/* HEADER BANNER */}
      <header className="postjob-header">
        <div>
          <h1>Post a New Position</h1>
          <p>Publish a high-visibility job listing to top tech candidates.</p>
        </div>
        <div className="postjob-actions-top">
          <button type="button" className="btn-outline-small" onClick={handleSaveDraft}>
            Save Draft
          </button>
          <button type="button" className="btn-outline-small" onClick={() => navigate("/admin")}>
            View Stored Jobs
          </button>
        </div>
      </header>

      {/* STEP-BY-STEP FORM */}
      <form className="postjob-form" onSubmit={handleSubmit}>
        <section className="postjob-main">
          {/* STEP 1 */}
          <div className="postjob-card">
            <h2><span className="step-num">1</span> Job Basics & Title</h2>
            <p className="hint">Core identity and position details.</p>

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
                  placeholder="e.g. Google / Acme Labs"
                  required
                />
              </div>

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

          {/* STEP 2 */}
          <div className="postjob-card">
            <h2><span className="step-num">2</span> Domain & Work Mode</h2>
            <p className="hint">Categorize position by discipline, employment type, and work location.</p>

            <div className="grid-2">
              <div className="field">
                <label>Primary Domain</label>
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
                    placeholder="e.g. DevRel / Web3"
                  />
                </div>
              )}

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
                <label>Experience Requirement</label>
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

          {/* STEP 3 */}
          <div className="postjob-card">
            <h2><span className="step-num">3</span> Compensation & Location</h2>
            <p className="hint">Specify location and competitive salary package range.</p>

            <div className="grid-2">
              <div className="field">
                <label>Location City / Country</label>
                <input
                  value={job.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="e.g. Bangalore, India / Remote"
                />
              </div>

              <div className="field">
                <label>Salary Package Range</label>
                <div className="salary-row">
                  <select
                    value={job.currency}
                    onChange={(e) => updateField("currency", e.target.value)}
                  >
                    <option value="₹">₹ (INR)</option>
                    <option value="$">$ (USD)</option>
                    <option value="€">€ (EUR)</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    placeholder="Min (e.g. 15)"
                    value={job.minSalary}
                    onChange={(e) => updateField("minSalary", e.target.value)}
                  />
                  <span className="salary-sep">–</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max (e.g. 25)"
                    value={job.maxSalary}
                    onChange={(e) => updateField("maxSalary", e.target.value)}
                  />
                  <select
                    value={job.salaryPeriod}
                    onChange={(e) => updateField("salaryPeriod", e.target.value)}
                  >
                    <option value="LPA">LPA</option>
                    <option value="Year">/Year</option>
                    <option value="Month">/Month</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 4 */}
          <div className="postjob-card">
            <h2><span className="step-num">4</span> Role Description & Responsibilities</h2>
            <p className="hint">Detailed scope, objectives, and qualifications required.</p>

            <div className="field">
              <label>Short Role Summary</label>
              <textarea
                rows={3}
                value={job.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Summarize the core impact of this role in 2–3 lines..."
              />
            </div>

            <div className="field">
              <label>Key Responsibilities</label>
              <textarea
                rows={4}
                value={job.responsibilities}
                onChange={(e) => updateField("responsibilities", e.target.value)}
                placeholder="- Build and maintain modern web applications using React.\n- Collaborate with design and backend engineers."
              />
            </div>

            <div className="field">
              <label>Requirements & Qualifications</label>
              <textarea
                rows={4}
                value={job.requirements}
                onChange={(e) => updateField("requirements", e.target.value)}
                placeholder="- 3+ years experience with modern JavaScript / TypeScript.\n- Strong problem-solving and system architecture skills."
              />
            </div>
          </div>

          {/* STEP 5 */}
          <div className="postjob-card">
            <h2><span className="step-num">5</span> Skills & Technologies Required</h2>
            <p className="hint">Tag key tools, languages, and frameworks for automated matching.</p>

            <div className="field">
              <label>Add Skill Tag</label>
              <div className="skills-input-row">
                <input
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="e.g. React, Node.js, AWS, Python"
                />
                <button type="button" className="btn-primary" onClick={addSkill}>
                  + Add Skill
                </button>
              </div>
            </div>

            <div className="skills-chip-row">
              {skills.map((s) => (
                <span key={s} className="skill-chip">
                  {s}
                  <button type="button" onClick={() => removeSkill(s)}>✕</button>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* SIDEBAR PREVIEW & ACTION */}
        <aside className="postjob-side">
          <div className="postjob-card side-card">
            <h3>Application Destination</h3>
            <p className="hint">Where candidates submit their application.</p>
            <div className="field">
              <label>Apply URL / HR Email</label>
              <input
                value={job.applyLink}
                onChange={(e) => updateField("applyLink", e.target.value)}
                placeholder="https://company.com/careers/123 or hr@company.com"
              />
            </div>
          </div>

          <div className="postjob-card side-card">
            <h3>Live Card Preview</h3>
            <div className="preview-card-box">
              <div className="preview-avatar">{(job.company || "C").charAt(0).toUpperCase()}</div>
              <div>
                <p className="preview-title">{job.title || "Senior Engineer Title"}</p>
                <p className="preview-company">{job.company || "Company Name"} • {effectiveDomain}</p>
                <p className="preview-meta">📍 {job.location || "Remote"} • {job.type} • {job.mode}</p>
                {job.minSalary && job.maxSalary && (
                  <p className="preview-salary">💰 {job.currency}{job.minSalary}–{job.maxSalary} {job.salaryPeriod}</p>
                )}
                {skills.length > 0 && (
                  <div className="preview-skills">
                    {skills.map((s) => (
                      <span key={s}>{s}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="postjob-card side-card">
            <h3>Publish Position</h3>
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
