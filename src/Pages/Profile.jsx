import React, { useState, useRef, useEffect } from "react";
import "./Profile.css";
import { apiGetProfile, apiUpdateProfile, apiUploadResume, apiUploadAvatar } from "../api";

const BACKEND_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000" : "";

const SECTIONS = [
  { id: "basic",      label: "Basic Details",    required: true },
  { id: "resume",     label: "Resume",            required: false },
  { id: "about",      label: "About",             required: true },
  { id: "skills",     label: "Skills",            required: true },
  { id: "education",  label: "Education",         required: true },
  { id: "experience", label: "Work Experience",   required: false },
  { id: "personal",   label: "Personal Details",  required: false },
];

export default function Profile() {
  const [active, setActive]           = useState("basic");
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [saving, setSaving]           = useState(false);
  const [saveMsg, setSaveMsg]         = useState(null); // {type,text}
  const [loadError, setLoadError]     = useState(null);

  const [profile, setProfile] = useState({
    firstName: "", lastName: "", username: "",
    email: "", mobileCountry: "+91", mobileNumber: "",
    altCountry: "+91", altNumber: "", gender: "",
    resumeFileName: "", resumeUrl: "",
    about: "",
    skillsInput: "", skills: [],
    eduInstitute: "", eduDegree: "", eduYears: "",
    expTitle: "", expCompany: "", expLocation: "", expDuration: "", expDesc: "",
    dob: "", personalPhone: "", preferredLocation: "", preferredJobType: "",
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const avatarInputRef = useRef(null);

  // ─── Load profile from backend on mount ──────────────────────
  useEffect(() => {
    const token = localStorage.getItem("jb_token");
    if (!token) return; // not logged in, use blank form

    apiGetProfile()
      .then((user) => {
        if (!user) return;
        // Map backend fields → profile state
        const nameParts = (user.name || "").split(" ");
        setProfile((prev) => ({
          ...prev,
          firstName:       nameParts[0] || "",
          lastName:        nameParts.slice(1).join(" ") || "",
          email:           user.email || "",
          mobileNumber:    user.phone || "",
          about:           user.bio || user.about || "",
          skills:          Array.isArray(user.skills) ? user.skills : [],
          gender:          user.gender || "",
          dob:             user.dob || "",
          preferredLocation: user.preferredLocation || "",
          preferredJobType:  user.preferredJobType || "",
          resumeUrl:       user.resumeUrl || "",
          resumeFileName:  user.resumeUrl ? user.resumeUrl.split("/").pop() : "",
          // education/experience (stored as JSON in bio fields if needed)
          eduInstitute:    user.eduInstitute || "",
          eduDegree:       user.eduDegree || "",
          eduYears:        user.eduYears || "",
          expTitle:        user.expTitle || "",
          expCompany:      user.expCompany || "",
          expLocation:     user.expLocation || "",
          expDuration:     user.expDuration || "",
          expDesc:         user.expDesc || "",
        }));
        if (user.avatar) {
          setAvatarPreview(
            user.avatar.startsWith("http") ? user.avatar : `${BACKEND_BASE}${user.avatar}`
          );
        }
      })
      .catch((err) => {
        console.warn("Could not load profile from backend:", err.message);
        setLoadError("Could not load profile. Using local data.");
      });
  }, []);

  function updateField(field, value) {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }

  function showMsg(type, text) {
    setSaveMsg({ type, text });
    setTimeout(() => setSaveMsg(null), 3500);
  }

  // ─── Save section to backend ──────────────────────────────────
  async function handleSave(sectionName) {
    const token = localStorage.getItem("jb_token");
    if (!token) {
      showMsg("error", "Please sign in to save your profile.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: `${profile.firstName} ${profile.lastName}`.trim(),
        bio: profile.about,
        phone: profile.mobileNumber,
        skills: profile.skills,
        gender: profile.gender,
        dob: profile.dob,
        preferredLocation: profile.preferredLocation,
        preferredJobType: profile.preferredJobType,
        // extended fields saved as flat keys
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

      // Also update localStorage user name
      try {
        const stored = JSON.parse(localStorage.getItem("jb_user") || "{}");
        stored.name = payload.name || stored.name;
        localStorage.setItem("jb_user", JSON.stringify(stored));
        window.dispatchEvent(new Event("storage"));
      } catch { /* ignore */ }

      showMsg("success", `✅ ${sectionName} saved successfully!`);
    } catch (err) {
      showMsg("error", `❌ Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  // ─── Avatar ──────────────────────────────────────────────────
  function handleAvatarClick() {
    if (avatarInputRef.current) avatarInputRef.current.click();
  }

  async function handleAvatarChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    // local preview immediately
    setAvatarPreview(URL.createObjectURL(file));

    const token = localStorage.getItem("jb_token");
    if (!token) return;
    try {
      const res = await apiUploadAvatar(file);
      if (res?.avatar) {
        setAvatarPreview(`${BACKEND_BASE}${res.avatar}`);
        showMsg("success", "✅ Avatar updated!");
      }
    } catch (err) {
      showMsg("error", `Avatar upload failed: ${err.message}`);
    }
  }

  // ─── Resume upload ────────────────────────────────────────────
  async function handleResumeUpload(file) {
    if (!file) return;
    updateField("resumeFileName", file.name);
    const token = localStorage.getItem("jb_token");
    if (!token) return;
    try {
      const res = await apiUploadResume(file);
      if (res?.resumeUrl) {
        updateField("resumeUrl", res.resumeUrl);
        showMsg("success", `✅ Resume "${file.name}" uploaded!`);
      }
    } catch (err) {
      showMsg("error", `Resume upload failed: ${err.message}`);
    }
  }

  // ─── Skills ───────────────────────────────────────────────────
  function addSkill() {
    const value = profile.skillsInput.trim();
    if (!value || profile.skills.includes(value)) return;
    setProfile((p) => ({ ...p, skills: [...p.skills, value], skillsInput: "" }));
  }

  function handleSkillKeyDown(e) {
    if (e.key === "Enter") { e.preventDefault(); addSkill(); }
  }

  function removeSkill(skill) {
    setProfile((p) => ({ ...p, skills: p.skills.filter((s) => s !== skill) }));
  }

  return (
    <div className="profile-edit-wrapper">
      <div className="profile-edit-panel">
        {/* top bar */}
        <header className="profile-topbar">
          <button className="back-btn" type="button" onClick={() => window.history.back()}>←</button>
          <h1>Edit Profile</h1>
        </header>

        {/* Save message banner */}
        {saveMsg && (
          <div className={`profile-save-msg ${saveMsg.type}`}>{saveMsg.text}</div>
        )}
        {loadError && (
          <div className="profile-save-msg error" style={{ marginBottom: "8px" }}>{loadError}</div>
        )}

        <div className="profile-main-layout">
          {/* LEFT – profile sidenav */}
          {!leftCollapsed && (
            <aside className="profile-left">
              <div className="profile-left-header">
                <div>
                  <h2>Profile</h2>
                  <p>Complete each step to strengthen your profile.</p>
                </div>
                <button type="button" className="profile-left-toggle"
                  onClick={() => setLeftCollapsed(true)} title="Hide profile sections">✕</button>
              </div>

              <div className="resume-banner">
                <div className="resume-thumb" />
                <div className="resume-banner-text">
                  <h3>Your Resume</h3>
                  <p>{profile.resumeFileName ? profile.resumeFileName : "Upload your resume to stand out."}</p>
                </div>
                <button className="btn-light" type="button" onClick={() => setActive("resume")}>
                  {profile.resumeFileName ? "Update" : "Upload"}
                </button>
              </div>

              <div className="enhance-card">
                <h4>Enhance your Profile</h4>
                <p>Regular updates improve your chances of shortlisting.</p>
              </div>

              <nav className="profile-section-nav">
                {SECTIONS.map((sec) => (
                  <button key={sec.id} type="button"
                    className={"section-item" + (active === sec.id ? " active" : "")}
                    onClick={() => setActive(sec.id)}>
                    <span className="section-status">✔</span>
                    <span className="section-text">
                      {sec.label}
                      {sec.required && <span className="required-pill">Required</span>}
                    </span>
                  </button>
                ))}
              </nav>
            </aside>
          )}

          {/* RIGHT – active section */}
          <section className="profile-right">
            {leftCollapsed && (
              <button type="button" className="profile-left-toggle show"
                onClick={() => setLeftCollapsed(false)}>☰ Sections</button>
            )}

            {/* BASIC DETAILS */}
            {active === "basic" && (
              <div className="section-card">
                <header className="section-header">
                  <div className="section-header-left">
                    <span className="section-status-dot done" />
                    <h2>Basic Details</h2>
                  </div>
                </header>

                <div className="basic-details-layout">
                  <div className="avatar-block">
                    <div className="avatar-circle" onClick={handleAvatarClick}>
                      {avatarPreview
                        ? <img src={avatarPreview} alt="Avatar" className="avatar-img" />
                        : <span>+</span>}
                    </div>
                    <button className="btn-outline-small" type="button" onClick={handleAvatarClick}>
                      {avatarPreview ? "Change Photo" : "Upload Photo"}
                    </button>
                    <input type="file" ref={avatarInputRef} style={{ display: "none" }}
                      accept="image/*" onChange={handleAvatarChange} />
                  </div>

                  <div className="basic-form-grid">
                    <div className="field">
                      <label>First Name <span className="req">*</span></label>
                      <input value={profile.firstName} onChange={(e) => updateField("firstName", e.target.value)}
                        placeholder="Enter your first name" />
                    </div>
                    <div className="field">
                      <label>Last Name <span className="req">*</span></label>
                      <input value={profile.lastName} onChange={(e) => updateField("lastName", e.target.value)}
                        placeholder="Enter your last name" />
                    </div>
                    <div className="field">
                      <label>Email <span className="req">*</span></label>
                      <input value={profile.email} readOnly
                        style={{ opacity: 0.6, cursor: "not-allowed" }}
                        placeholder="Your email (from account)" />
                    </div>
                    <div className="field">
                      <label>Mobile <span className="req">*</span></label>
                      <div className="phone-row">
                        <select value={profile.mobileCountry}
                          onChange={(e) => updateField("mobileCountry", e.target.value)}>
                          <option value="+91">+91</option>
                          <option value="+1">+1</option>
                          <option value="+44">+44</option>
                        </select>
                        <input value={profile.mobileNumber}
                          onChange={(e) => updateField("mobileNumber", e.target.value)}
                          placeholder="Enter mobile number" />
                      </div>
                    </div>
                    <div className="field full">
                      <label>Gender <span className="req">*</span></label>
                      <div className="gender-row">
                        {["male", "female", "other"].map((g) => (
                          <button key={g} type="button"
                            className={"gender-pill" + (profile.gender === g ? " active" : "")}
                            onClick={() => updateField("gender", g)}>
                            {g.charAt(0).toUpperCase() + g.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="section-footer">
                  <button className="btn-primary-large" type="button"
                    onClick={() => handleSave("Basic details")} disabled={saving}>
                    {saving ? "Saving..." : "✓ Save"}
                  </button>
                </div>
              </div>
            )}

            {/* RESUME */}
            {active === "resume" && (
              <div className="section-card">
                <header className="section-header">
                  <div className="section-header-left">
                    <span className="section-status-dot done" />
                    <h2>Resume</h2>
                  </div>
                </header>
                <div className="resume-upload">
                  <div className="resume-drop">
                    <span className="resume-icon">📄</span>
                    <p className="resume-text">
                      Drag &amp; drop your resume here or
                      <span className="resume-link"> browse files</span>
                    </p>
                    <p className="resume-sub">PDF, DOC, DOCX • Max 5MB</p>
                    {profile.resumeFileName && (
                      <p className="resume-file">📎 {profile.resumeFileName}</p>
                    )}
                    {profile.resumeUrl && (
                      <a
                        href={`${BACKEND_BASE}${profile.resumeUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="resume-link"
                        style={{ fontSize: "0.82rem" }}
                      >
                        View uploaded resume ↗
                      </a>
                    )}
                  </div>
                  <label className="btn-primary" style={{ cursor: "pointer" }}>
                    Upload Resume
                    <input type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files && e.target.files[0];
                        if (file) handleResumeUpload(file);
                      }} />
                  </label>
                </div>
              </div>
            )}

            {/* ABOUT */}
            {active === "about" && (
              <div className="section-card">
                <header className="section-header">
                  <div className="section-header-left">
                    <span className="section-status-dot done" />
                    <h2>About</h2>
                  </div>
                </header>
                <textarea className="textarea" rows={6} value={profile.about}
                  onChange={(e) => updateField("about", e.target.value)}
                  placeholder="Describe your background, interests, and career goals..." />
                <div className="section-footer">
                  <button className="btn-primary-large" type="button"
                    onClick={() => handleSave("About")} disabled={saving}>
                    {saving ? "Saving..." : "✓ Save"}
                  </button>
                </div>
              </div>
            )}

            {/* SKILLS */}
            {active === "skills" && (
              <div className="section-card">
                <header className="section-header">
                  <div className="section-header-left">
                    <span className="section-status-dot done" />
                    <h2>Skills</h2>
                  </div>
                </header>
                <div className="field">
                  <label>Add Skill</label>
                  <div className="skills-input-row">
                    <input value={profile.skillsInput}
                      onChange={(e) => updateField("skillsInput", e.target.value)}
                      onKeyDown={handleSkillKeyDown}
                      placeholder="e.g. React, Node.js, SQL" />
                    <button type="button" className="btn-primary" onClick={addSkill}>Add</button>
                  </div>
                </div>
                <div className="skills-chip-row">
                  {profile.skills.map((skill) => (
                    <span key={skill} className="skill-chip">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)}>✕</button>
                    </span>
                  ))}
                </div>
                <div className="section-footer">
                  <button className="btn-primary-large" type="button"
                    onClick={() => handleSave("Skills")} disabled={saving}>
                    {saving ? "Saving..." : "✓ Save"}
                  </button>
                </div>
              </div>
            )}

            {/* EDUCATION */}
            {active === "education" && (
              <div className="section-card">
                <header className="section-header">
                  <div className="section-header-left">
                    <span className="section-status-dot done" />
                    <h2>Education</h2>
                  </div>
                </header>
                <div className="profile-grid-2">
                  <div className="field">
                    <label>Institute / University</label>
                    <input value={profile.eduInstitute}
                      onChange={(e) => updateField("eduInstitute", e.target.value)}
                      placeholder="e.g. XYZ Institute of Technology" />
                  </div>
                  <div className="field">
                    <label>Degree / Program</label>
                    <input value={profile.eduDegree}
                      onChange={(e) => updateField("eduDegree", e.target.value)}
                      placeholder="e.g. B.Tech in CSE" />
                  </div>
                  <div className="field">
                    <label>Duration</label>
                    <input value={profile.eduYears}
                      onChange={(e) => updateField("eduYears", e.target.value)}
                      placeholder="e.g. 2021 – 2025" />
                  </div>
                </div>
                <div className="section-footer">
                  <button className="btn-primary-large" type="button"
                    onClick={() => handleSave("Education")} disabled={saving}>
                    {saving ? "Saving..." : "✓ Save"}
                  </button>
                </div>
              </div>
            )}

            {/* EXPERIENCE */}
            {active === "experience" && (
              <div className="section-card">
                <header className="section-header">
                  <div className="section-header-left">
                    <span className="section-status-dot done" />
                    <h2>Work Experience</h2>
                  </div>
                </header>
                <div className="profile-grid-2">
                  <div className="field">
                    <label>Job Title</label>
                    <input value={profile.expTitle}
                      onChange={(e) => updateField("expTitle", e.target.value)}
                      placeholder="e.g. Frontend Intern" />
                  </div>
                  <div className="field">
                    <label>Company</label>
                    <input value={profile.expCompany}
                      onChange={(e) => updateField("expCompany", e.target.value)}
                      placeholder="e.g. ABC Tech Pvt. Ltd." />
                  </div>
                  <div className="field">
                    <label>Location</label>
                    <input value={profile.expLocation}
                      onChange={(e) => updateField("expLocation", e.target.value)}
                      placeholder="Remote / City, Country" />
                  </div>
                  <div className="field">
                    <label>Duration</label>
                    <input value={profile.expDuration}
                      onChange={(e) => updateField("expDuration", e.target.value)}
                      placeholder="e.g. Jun 2023 – Aug 2023" />
                  </div>
                </div>
                <div className="field">
                  <label>Responsibilities</label>
                  <textarea className="textarea" rows={4} value={profile.expDesc}
                    onChange={(e) => updateField("expDesc", e.target.value)}
                    placeholder="Describe your work, tech stack, and impact." />
                </div>
                <div className="section-footer">
                  <button className="btn-primary-large" type="button"
                    onClick={() => handleSave("Work experience")} disabled={saving}>
                    {saving ? "Saving..." : "✓ Save"}
                  </button>
                </div>
              </div>
            )}

            {/* PERSONAL DETAILS */}
            {active === "personal" && (
              <div className="section-card">
                <header className="section-header">
                  <div className="section-header-left">
                    <span className="section-status-dot done" />
                    <h2>Personal Details</h2>
                  </div>
                </header>
                <div className="profile-grid-2">
                  <div className="field">
                    <label>Date of Birth</label>
                    <input type="date" value={profile.dob}
                      onChange={(e) => updateField("dob", e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Preferred Job Location</label>
                    <input value={profile.preferredLocation}
                      onChange={(e) => updateField("preferredLocation", e.target.value)}
                      placeholder="e.g. Bangalore, Remote" />
                  </div>
                  <div className="field">
                    <label>Preferred Job Type</label>
                    <input value={profile.preferredJobType}
                      onChange={(e) => updateField("preferredJobType", e.target.value)}
                      placeholder="e.g. Full-Time, Internship" />
                  </div>
                </div>
                <div className="section-footer">
                  <button className="btn-primary-large" type="button"
                    onClick={() => handleSave("Personal details")} disabled={saving}>
                    {saving ? "Saving..." : "✓ Save"}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
