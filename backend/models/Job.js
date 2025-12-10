import mongoose from "mongoose";

export default mongoose.model(
  "Job",
  new mongoose.Schema(
    {
      title: String,
      company: String,
      location: String,
      type: String,
      mode: String,
      domain: String,
      experience: String,
      minSalary: Number,
      maxSalary: Number,
      skills: [String],
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    },
    { timestamps: true }
  )
);
