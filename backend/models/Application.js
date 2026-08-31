import mongoose from "mongoose";

export default mongoose.model(
  "Application",
  new mongoose.Schema(
    {
      job: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
      applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: {
        type: String,
        enum: ["Applied", "Reviewing", "Accepted", "Rejected"],
        default: "Applied",
      },
      coverLetter: { type: String, default: "" },
      notes: { type: String, default: "" }, // internal employer notes
    },
    { timestamps: true }
  )
);
