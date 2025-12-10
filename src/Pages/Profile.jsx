import React, { useState, useRef } from "react";
import "./Profile.css";

const SECTIONS = [
  { id: "basic", label: "Basic Details", required: true },
  { id: "resume", label: "Resume", required: false },
  { id: "about", label: "About", required: true },
  { id: "skills", label: "Skills", required: true },
  { id: "education", label: "Education", required: true },
  { id: "experience", label: "Work Experience", required: false },
  { id: "personal", label: "Personal Details", required: false },
];

export default function Profile() {
  const [active, setActive] = useState("basic");
  const [leftCollapsed, setLeftCollapsed] = useState(false);

  // profile form state (all sections)
  const [profile, setProfile] = useState({
    // basic
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    mobileCountry: "+91",
    mobileNumber: "",
    altCountry: "+91",
    altNumber: "",
    gender: "",
    // resume
    resumeFileName: "",
    // about
    about: "",
    // skills
    skillsInput: "",
    skills: [],
    // education (single item skeleton)
    eduInstitute: "",
    eduDegree: "",
    eduYears: "",
    // experience
    expTitle: "",
    expCompany: "",
    expLocation: "",
    expDuration: "",
    expDesc: "",
    // personal
    dob: "",
    personalPhone: "",
    preferredLocation: "",
    preferredJobType: "",
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const avatarInputRef = useRef(null);

  function updateField(field, value) {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }

  function handleSectionClick(id) {
    setActive(id);
  }

  function handleSave(sectionName) {
    // demo: persist to localStorage (optional)
    localStorage.setItem("jb_profile", JSON.stringify(profile));
    alert(`${sectionName} saved (demo)`);
  }

  // avatar
  function handleAvatarClick() {
    if (avatarInputRef.current) avatarInputRef.current.click();
  }

  function handleAvatarChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  }

  // skills
  function addSkill() {
    const value = profile.skillsInput.trim();
    if (!value) return;
    if (profile.skills.includes(value)) return;
    setProfile((p) => ({
      ...p,
      skills: [...p.skills, value],
      skillsInput: "",
    }));
  }

  function handleSkillKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  }

  function removeSkill(skill) {
    setProfile((p) => ({
      ...p,
      skills: p.skills.filter((s) => s !== skill),
    }));
  }

  return (
    <div className="profile-edit-wrapper">
      <div className="profile-edit-panel">
        {/* top bar */}
        <header className="profile-topbar">
          <button className="back-btn" type="button">
            ←
          </button>
          <h1>Edit Profile</h1>
        </header>

        <div className="profile-main-layout">
          {/* LEFT – profile sidenav with toggle */}
          {!leftCollapsed && (
            <aside className="profile-left">
              <div className="profile-left-header">
                <div>
                  <h2>Profile</h2>
                  <p>Complete each step to strengthen your profile.</p>
                </div>
                <button
                  type="button"
                  className="profile-left-toggle"
                  onClick={() => setLeftCollapsed(true)}
                  title="Hide profile sections"
                >
                  ✕
                </button>
              </div>

              <div className="resume-banner">
                <div className="resume-thumb" />
                <div className="resume-banner-text">
                  <h3>Create your Resume</h3>
                  <p>Build a professional resume from your profile.</p>
                </div>
                <button className="btn-light" type="button">
                  Create
                </button>
              </div>

              <div className="enhance-card">
                <h4>Enhance your Profile</h4>
                <p>Regular updates improve your chances of shortlisting.</p>
              </div>

              <nav className="profile-section-nav">
                {SECTIONS.map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    className={
                      "section-item" + (active === sec.id ? " active" : "")
                    }
                    onClick={() => handleSectionClick(sec.id)}
                  >
                    <span className="section-status">✔</span>
                    <span className="section-text">
                      {sec.label}
                      {sec.required && (
                        <span className="required-pill">Required</span>
                      )}
                    </span>
                  </button>
                ))}
              </nav>
            </aside>
          )}

          {/* RIGHT – active section */}
          <section className="profile-right">
            {leftCollapsed && (
              <button
                type="button"
                className="profile-left-toggle show"
                onClick={() => setLeftCollapsed(false)}
              >
                ☰ Sections
              </button>
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
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar"
                          className="avatar-img"
                        />
                      ) : (
                        <span>+</span>
                      )}
                    </div>
                    <button
                      className="btn-outline-small"
                      type="button"
                      onClick={handleAvatarClick}
                    >
                      {avatarPreview ? "Change Photo" : "Upload Photo"}
                    </button>
                    <input
                      type="file"
                      ref={avatarInputRef}
                      style={{ display: "none" }}
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </div>

                  <div className="basic-form-grid">
                    <div className="field">
                      <label>
                        First Name <span className="req">*</span>
                      </label>
                      <input
                        value={profile.firstName}
                        onChange={(e) =>
                          updateField("firstName", e.target.value)
                        }
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div className="field">
                      <label>
                        Last Name <span className="req">*</span>
                      </label>
                      <input
                        value={profile.lastName}
                        onChange={(e) =>
                          updateField("lastName", e.target.value)
                        }
                        placeholder="Enter your last name"
                      />
                    </div>

                    <div className="field">
                      <label>
                        Username <span className="req">*</span>
                      </label>
                      <input
                        value={profile.username}
                        onChange={(e) =>
                          updateField("username", e.target.value)
                        }
                        placeholder="Choose a username"
                      />
                    </div>

                    <div className="field email-field">
                      <label>
                        Email <span className="req">*</span>
                      </label>
                      <div className="email-row">
                        <input
                          value={profile.email}
                          onChange={(e) =>
                            updateField("email", e.target.value)
                          }
                          placeholder="Enter your email"
                        />
                        <button type="button" className="link-btn">
                          Update Email
                        </button>
                      </div>
                    </div>

                    <div className="field">
                      <label>
                        Mobile <span className="req">*</span>
                      </label>
                      <div className="phone-row">
                        <select
                          value={profile.mobileCountry}
                          onChange={(e) =>
                            updateField("mobileCountry", e.target.value)
                          }
                        >
                          <option value="+91">+91</option>
                          <option value="+1">+1</option>
                        </select>
                        <input
                          value={profile.mobileNumber}
                          onChange={(e) =>
                            updateField("mobileNumber", e.target.value)
                          }
                          placeholder="Enter mobile number"
                        />
                      </div>
                    </div>

                    <div className="field">
                      <label>Alternate Mobile</label>
                      <div className="phone-row">
                        <select
                          value={profile.altCountry}
                          onChange={(e) =>
                            updateField("altCountry", e.target.value)
                          }
                        >
                          <option value="+91">+91</option>
                          <option value="+1">+1</option>
                        </select>
                        <input
                          value={profile.altNumber}
                          onChange={(e) =>
                            updateField("altNumber", e.target.value)
                          }
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    <div className="field full">
                      <label>
                        Gender <span className="req">*</span>
                      </label>
                      <div className="gender-row">
                        <button
                          type="button"
                          className={
                            "gender-pill" +
                            (profile.gender === "male" ? " active" : "")
                          }
                          onClick={() => updateField("gender", "male")}
                        >
                          ♂ Male
                        </button>
                        <button
                          type="button"
                          className={
                            "gender-pill" +
                            (profile.gender === "female" ? " active" : "")
                          }
                          onClick={() => updateField("gender", "female")}
                        >
                          ♀ Female
                        </button>
                        <button
                          type="button"
                          className={
                            "gender-pill" +
                            (profile.gender === "more" ? " active" : "")
                          }
                          onClick={() => updateField("gender", "more")}
                        >
                          👤 More Options
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="section-footer">
                  <button
                    className="btn-primary-large"
                    type="button"
                    onClick={() => handleSave("Basic details")}
                  >
                    ✓ Save
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
                      <p className="resume-file">Selected: {profile.resumeFileName}</p>
                    )}
                  </div>
                  <label className="btn-primary" style={{ cursor: "pointer" }}>
                    Upload
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file =
                          e.target.files && e.target.files[0];
                        if (file) {
                          updateField("resumeFileName", file.name);
                        }
                      }}
                    />
                  </label>
                </div>
                <div className="section-footer">
                  <button
                    className="btn-primary-large"
                    type="button"
                    onClick={() => handleSave("Resume")}
                  >
                    ✓ Save
                  </button>
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
                <textarea
                  className="textarea"
                  rows={6}
                  value={profile.about}
                  onChange={(e) => updateField("about", e.target.value)}
                  placeholder="Describe your background, interests, and career goals..."
                />
                <div className="section-footer">
                  <button
                    className="btn-primary-large"
                    type="button"
                    onClick={() => handleSave("About")}
                  >
                    ✓ Save
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
                    <input
                      value={profile.skillsInput}
                      onChange={(e) =>
                        updateField("skillsInput", e.target.value)
                      }
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
                  {profile.skills.map((skill) => (
                    <span key={skill} className="skill-chip">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                <div className="section-footer">
                  <button
                    className="btn-primary-large"
                    type="button"
                    onClick={() => handleSave("Skills")}
                  >
                    ✓ Save
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
                    <input
                      value={profile.eduInstitute}
                      onChange={(e) =>
                        updateField("eduInstitute", e.target.value)
                      }
                      placeholder="e.g. XYZ Institute of Technology"
                    />
                  </div>
                  <div className="field">
                    <label>Degree / Program</label>
                    <input
                      value={profile.eduDegree}
                      onChange={(e) =>
                        updateField("eduDegree", e.target.value)
                      }
                      placeholder="e.g. B.Tech in CSE"
                    />
                  </div>
                  <div className="field">
                    <label>Duration</label>
                    <input
                      value={profile.eduYears}
                      onChange={(e) =>
                        updateField("eduYears", e.target.value)
                      }
                      placeholder="e.g. 2021 – 2025"
                    />
                  </div>
                </div>
                <div className="section-footer">
                  <button
                    className="btn-primary-large"
                    type="button"
                    onClick={() => handleSave("Education")}
                  >
                    ✓ Save
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
                    <input
                      value={profile.expTitle}
                      onChange={(e) =>
                        updateField("expTitle", e.target.value)
                      }
                      placeholder="e.g. Frontend Intern"
                    />
                  </div>
                  <div className="field">
                    <label>Company</label>
                    <input
                      value={profile.expCompany}
                      onChange={(e) =>
                        updateField("expCompany", e.target.value)
                      }
                      placeholder="e.g. ABC Tech Pvt. Ltd."
                    />
                  </div>
                  <div className="field">
                    <label>Location</label>
                    <input
                      value={profile.expLocation}
                      onChange={(e) =>
                        updateField("expLocation", e.target.value)
                      }
                      placeholder="Remote / City, Country"
                    />
                  </div>
                  <div className="field">
                    <label>Duration</label>
                    <input
                      value={profile.expDuration}
                      onChange={(e) =>
                        updateField("expDuration", e.target.value)
                      }
                      placeholder="e.g. Jun 2023 – Aug 2023"
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Responsibilities</label>
                  <textarea
                    className="textarea"
                    rows={4}
                    value={profile.expDesc}
                    onChange={(e) =>
                      updateField("expDesc", e.target.value)
                    }
                    placeholder="Describe your work, tech stack, and impact."
                  />
                </div>
                <div className="section-footer">
                  <button
                    className="btn-primary-large"
                    type="button"
                    onClick={() => handleSave("Work experience")}
                  >
                    ✓ Save
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
                    <input
                      type="date"
                      value={profile.dob}
                      onChange={(e) => updateField("dob", e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>Phone Number</label>
                    <input
                      value={profile.personalPhone}
                      onChange={(e) =>
                        updateField("personalPhone", e.target.value)
                      }
                      placeholder="e.g. +91 XXXXX XXXXX"
                    />
                  </div>
                  <div className="field">
                    <label>Preferred Job Location</label>
                    <input
                      value={profile.preferredLocation}
                      onChange={(e) =>
                        updateField("preferredLocation", e.target.value)
                      }
                      placeholder="e.g. Bangalore, Remote"
                    />
                  </div>
                  <div className="field">
                    <label>Preferred Job Type</label>
                    <input
                      value={profile.preferredJobType}
                      onChange={(e) =>
                        updateField("preferredJobType", e.target.value)
                      }
                      placeholder="e.g. Full-Time, Internship"
                    />
                  </div>
                </div>
                <div className="section-footer">
                  <button
                    className="btn-primary-large"
                    type="button"
                    onClick={() => handleSave("Personal details")}
                  >
                    ✓ Save
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
