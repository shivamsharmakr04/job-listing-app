// src/Pages/Profile.jsx
import React, { useState, useRef, useEffect } from "react";
import "./Profile.css";
import { apiGetProfile, apiUpdateProfile, apiUploadResume, apiUploadAvatar, getBackendBase } from "../api";

const BACKEND_BASE = getBackendBase();

const SECTIONS = [
  { id: "basic", label: "Basic Info", icon: "👤" },
  { id: "about", label: "Bio & Overview", icon: "📝" },
  { id: "skills", label: "Skills & Tech", icon: "⚡" },
  { id: "experience", label: "Experience", icon: "💼" },
  { id: "education", label: "Education", icon: "🎓" },
  { id: "resume", label: "Resume & Documents", icon: "📄" },
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState("basic");
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const [profile, setProfile] = useState({
    firstName: "Alex",
    lastName: "Rivers",
    email: "alex.rivers@dev.io",
    mobileCountry: "+91",
    mobileNumber: "9876543210",
    gender: "male",
    about: "Passionate Full-Stack Engineer with 4+ years of experience building modern React web apps & Node microservices.",
    skillsInput: "",
    skills: ["React.js", "Node.js", "TypeScript", "GraphQL", "PostgreSQL", "Docker", "Tailwind CSS"],
    eduInstitute: "Indian Institute of Technology, Bombay",
    eduDegree: "B.Tech in Computer Science",
    eduYears: "2020 – 2024",
    expTitle: "Senior Frontend Engineer",
    expCompany: "Vercel Partner Labs",
    expLocation: "Remote",
    expDuration: "2023 – Present",
    expDesc: "Architected high-throughput web applications with 99.9% uptime and led a team of 4 engineers.",
    resumeFileName: "Alex_Rivers_Resume.pdf",
    resumeUrl: "",
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("jb_token");
    if (!token) return;

    apiGetProfile()
      .then((user) => {
        if (!user) return;
        const nameParts = (user.name || "").split(" ");
        setProfile((prev) => ({
          ...prev,
          firstName: nameParts[0] || prev.firstName,
          lastName: nameParts.slice(1).join(" ") || prev.lastName,
          email: user.email || prev.email,
          mobileNumber: user.phone || prev.mobileNumber,
          about: user.bio || user.about || prev.about,
          skills: Array.isArray(user.skills) && user.skills.length > 0 ? user.skills : prev.skills,
          gender: user.gender || prev.gender,
          resumeUrl: user.resumeUrl || prev.resumeUrl,
          resumeFileName: user.resumeUrl ? user.resumeUrl.split("/").pop() : prev.resumeFileName,
          eduInstitute: user.eduInstitute || prev.eduInstitute,
          eduDegree: user.eduDegree || prev.eduDegree,
          eduYears: user.eduYears || prev.eduYears,
          expTitle: user.expTitle || prev.expTitle,
          expCompany: user.expCompany || prev.expCompany,
          expLocation: user.expLocation || prev.expLocation,
          expDuration: user.expDuration || prev.expDuration,
          expDesc: user.expDesc || prev.expDesc,
        }));
        if (user.avatar) {
          setAvatarPreview(user.avatar.startsWith("http") ? user.avatar : `${BACKEND_BASE}${user.avatar}`);
        }
      })
      .catch(() => {});
  }, []);

  function triggerToast(msg) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }

  function updateField(field, value) {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        name: `${profile.firstName} ${profile.lastName}`.trim(),
        bio: profile.about,
        phone: profile.mobileNumber,
        skills: profile.skills,
        gender: profile.gender,
        eduInstitute: profile.eduInstitute,
        eduDegree: profile.eduDegree,
        eduYears: profile.eduYears,
        expTitle: profile.expTitle,
        expCompany: profile.expCompany,
        expLocation: profile.expLocation,
        expDuration: profile.expDuration,
        expDesc: profile.expDesc,
      };

      await apiUpdateProfile(payload);

      try {
        const stored = JSON.parse(localStorage.getItem("jb_user") || "{}");
        stored.name = payload.name;
        localStorage.setItem("jb_user", JSON.stringify(stored));
        window.dispatchEvent(new Event("storage"));
      } catch {}

      triggerToast("✅ Profile changes saved successfully!");
    } catch (err) {
      triggerToast(`❌ Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    try {
      const res = await apiUploadAvatar(file);
      if (res?.avatar) {
        setAvatarPreview(`${BACKEND_BASE}${res.avatar}`);
        triggerToast("✅ Profile picture updated!");
      }
    } catch (err) {
      triggerToast(`Upload failed: ${err.message}`);
    }
  }

  async function handleResumeUpload(file) {
    if (!file) return;
    updateField("resumeFileName", file.name);
    try {
      const res = await apiUploadResume(file);
      if (res?.resumeUrl) {
        updateField("resumeUrl", res.resumeUrl);
        triggerToast(`✅ Resume "${file.name}" uploaded!`);
      }
    } catch (err) {
      triggerToast(`Resume upload failed: ${err.message}`);
    }
  }

  function addSkill() {
    const val = profile.skillsInput.trim();
    if (!val || profile.skills.includes(val)) return;
    setProfile((prev) => ({ ...prev, skills: [...prev.skills, val], skillsInput: "" }));
  }

  function removeSkill(skill) {
    setProfile((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  }

  return (
    <div className="profile-page">
      {toastMsg && <div className="profile-toast">{toastMsg}</div>}

      {/* COVER BANNER HEADER */}
      <div className="profile-cover-banner">
        <div className="cover-overlay" />
        <div className="cover-content-row">
          <div className="avatar-wrapper" onClick={() => avatarInputRef.current?.click()}>
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="avatar-image" />
            ) : (
              <div className="avatar-fallback">
                {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
              </div>
            )}
            <div className="avatar-overlay-icon">📷</div>
            <input type="file" ref={avatarInputRef} style={{ display: "none" }} accept="image/*" onChange={handleAvatarChange} />
          </div>

          <div className="user-banner-meta">
            <h1>{profile.firstName} {profile.lastName}</h1>
            <p className="user-title-sub">
              {profile.expTitle} @ <strong>{profile.expCompany}</strong>
            </p>
            <div className="user-chips-row">
              <span className="profile-badge">🟢 Open to Work</span>
              <span className="profile-badge location">📍 Remote / Hybrid</span>
            </div>
          </div>

          <button className="btn-save-header" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "✓ Save Changes"}
          </button>
        </div>
      </div>

      {/* TABBED MAIN LAYOUT */}
      <div className="profile-body-layout">
        {/* Navigation Sidebar */}
        <aside className="profile-sidebar-tabs">
          <div className="sidebar-title">Profile Sections</div>
          {SECTIONS.map((sec) => (
            <button
              key={sec.id}
              type="button"
              className={`sidebar-tab-item ${activeTab === sec.id ? "active" : ""}`}
              onClick={() => setActiveTab(sec.id)}
            >
              <span className="tab-icon">{sec.icon}</span>
              <span className="tab-label">{sec.label}</span>
            </button>
          ))}
        </aside>

        {/* Tab Content Panel */}
        <main className="profile-content-panel">
          {activeTab === "basic" && (
            <div className="profile-form-section">
              <h2>Basic Details</h2>
              <p className="section-desc">Manage your personal identification and contact information.</p>

              <div className="grid-2-col">
                <div className="field-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label>Email Address</label>
                  <input type="email" value={profile.email} readOnly className="readonly-input" />
                </div>
                <div className="field-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    value={profile.mobileNumber}
                    onChange={(e) => updateField("mobileNumber", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "about" && (
            <div className="profile-form-section">
              <h2>Bio & Overview</h2>
              <p className="section-desc">Summarize your career experience and professional strengths.</p>

              <div className="field-group">
                <label>Professional Bio</label>
                <textarea
                  rows={6}
                  value={profile.about}
                  onChange={(e) => updateField("about", e.target.value)}
                  placeholder="Write a brief intro about yourself..."
                />
              </div>
            </div>
          )}

          {activeTab === "skills" && (
            <div className="profile-form-section">
              <h2>Skills & Tech Stack</h2>
              <p className="section-desc">Highlight technologies, frameworks, and programming languages.</p>

              <div className="add-skill-box">
                <input
                  type="text"
                  placeholder="Add skill (e.g. Docker, Vue.js)..."
                  value={profile.skillsInput}
                  onChange={(e) => updateField("skillsInput", e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                />
                <button type="button" className="btn-add-skill" onClick={addSkill}>+ Add</button>
              </div>

              <div className="skills-tags-grid">
                {profile.skills.map((sk) => (
                  <span key={sk} className="skill-interactive-chip">
                    {sk}
                    <button type="button" className="remove-skill-btn" onClick={() => removeSkill(sk)}>✕</button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeTab === "experience" && (
            <div className="profile-form-section">
              <h2>Work Experience</h2>
              <p className="section-desc">Detail your recent engineering roles and accomplishments.</p>

              <div className="grid-2-col">
                <div className="field-group">
                  <label>Job Title</label>
                  <input
                    type="text"
                    value={profile.expTitle}
                    onChange={(e) => updateField("expTitle", e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label>Company Name</label>
                  <input
                    type="text"
                    value={profile.expCompany}
                    onChange={(e) => updateField("expCompany", e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={profile.expLocation}
                    onChange={(e) => updateField("expLocation", e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label>Duration</label>
                  <input
                    type="text"
                    value={profile.expDuration}
                    onChange={(e) => updateField("expDuration", e.target.value)}
                  />
                </div>
              </div>

              <div className="field-group" style={{ marginTop: "16px" }}>
                <label>Key Responsibilities & Impact</label>
                <textarea
                  rows={4}
                  value={profile.expDesc}
                  onChange={(e) => updateField("expDesc", e.target.value)}
                />
              </div>
            </div>
          )}

          {activeTab === "education" && (
            <div className="profile-form-section">
              <h2>Education & Degrees</h2>
              <p className="section-desc">Academic background and relevant certifications.</p>

              <div className="grid-2-col">
                <div className="field-group">
                  <label>Institute / University</label>
                  <input
                    type="text"
                    value={profile.eduInstitute}
                    onChange={(e) => updateField("eduInstitute", e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label>Degree & Field of Study</label>
                  <input
                    type="text"
                    value={profile.eduDegree}
                    onChange={(e) => updateField("eduDegree", e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label>Graduation Year</label>
                  <input
                    type="text"
                    value={profile.eduYears}
                    onChange={(e) => updateField("eduYears", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "resume" && (
            <div className="profile-form-section">
              <h2>Resume & Documents</h2>
              <p className="section-desc">Upload your latest CV or portfolio PDF for employers.</p>

              <div className="resume-dropzone-card">
                <div className="dropzone-icon">📄</div>
                <h4>{profile.resumeFileName || "No resume uploaded"}</h4>
                <p>PDF, DOC, DOCX up to 5MB</p>

                <label className="btn-browse-resume">
                  Browse Resume File
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    style={{ display: "none" }}
                    onChange={(e) => e.target.files && handleResumeUpload(e.target.files[0])}
                  />
                </label>
              </div>
            </div>
          )}

          <div className="profile-footer-actions">
            <button type="button" className="btn-save-primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Profile Settings"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

