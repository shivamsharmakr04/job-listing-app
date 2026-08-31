import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const schema = new mongoose.Schema(
  {
    name:     { type: String, default: "" },
    email:    { type: String, unique: true },
    password: String,
    role:     { type: String, enum: ["admin", "jobseeker"], default: "jobseeker" },

    // ── Core Profile ──────────────────────────────────────────────
    bio:      { type: String, default: "" },
    about:    { type: String, default: "" },   // alias for bio
    phone:    { type: String, default: "" },
    location: { type: String, default: "" },
    skills:   { type: [String], default: [] },
    resumeUrl:{ type: String, default: "" },
    avatar:   { type: String, default: "" },
    gender:   { type: String, default: "" },
    dob:      { type: String, default: "" },

    // ── Job Preferences ───────────────────────────────────────────
    preferredLocation: { type: String, default: "" },
    preferredJobType:  { type: String, default: "" },

    // ── Education (single entry) ──────────────────────────────────
    eduInstitute: { type: String, default: "" },
    eduDegree:    { type: String, default: "" },
    eduYears:     { type: String, default: "" },

    // ── Work Experience (single entry) ────────────────────────────
    expTitle:    { type: String, default: "" },
    expCompany:  { type: String, default: "" },
    expLocation: { type: String, default: "" },
    expDuration: { type: String, default: "" },
    expDesc:     { type: String, default: "" },

    // ── Employer-specific ─────────────────────────────────────────
    company:  { type: String, default: "" },
    website:  { type: String, default: "" },
    industry: { type: String, default: "" },

    // ── Saved Jobs ────────────────────────────────────────────────
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
  },
  { timestamps: true }
);

schema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

schema.methods.comparePassword = function (pw) {
  return bcrypt.compare(pw, this.password);
};

export default mongoose.model("User", schema);
