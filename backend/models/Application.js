import mongoose from "mongoose";

export default mongoose.model(
  "Application",
  new mongoose.Schema(
    {
      job: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
      applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: { type: String, default: "Applied" }
    },
    { timestamps: true }
  )
);
