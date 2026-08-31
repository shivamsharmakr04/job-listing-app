import mongoose from "mongoose";

export default mongoose.model(
  "Job",
  new mongoose.Schema(
    {
      title: { type: String, required: true },
      company: { type: String, default: "" },
      location: { type: String, default: "" },
      type: { type: String, default: "Full-time" }, // Full-time, Part-time, Contract, Internship
      mode: { type: String, default: "On-site" },   // On-site, Remote, Hybrid
      domain: { type: String, default: "" },
      experience: { type: String, default: "" },
      minSalary: { type: Number, default: 0 },
      maxSalary: { type: Number, default: 0 },
      skills: { type: [String], default: [] },
      // New enriched fields
      description: { type: String, default: "" },
      qualifications: { type: String, default: "" },
      responsibilities: { type: String, default: "" },
      benefits: { type: String, default: "" },
      deadline: { type: Date, default: null },
      status: { type: String, enum: ["active", "closed", "draft"], default: "active" },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
  )
);
