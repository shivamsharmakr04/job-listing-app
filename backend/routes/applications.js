// backend/routes/applications.js
import express from "express";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import { auth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// GET /api/applications — logged-in job seeker: get own applications
router.get("/applications", auth, async (req, res) => {
  try {
    const apps = await Application.find({ applicant: req.user._id })
      .populate("job")
      .sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch applications", error: err.message });
  }
});

// GET /api/employer/applications — admin: get all applications for their posted jobs
router.get("/employer/applications", auth, requireAdmin, async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.user._id });
    const jobIds = jobs.map((j) => j._id);
    const apps = await Application.find({ job: { $in: jobIds } })
      .populate("job")
      .populate("applicant", "name email phone resumeUrl")
      .sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch employer applications", error: err.message });
  }
});

// PUT /api/applications/:id/status — admin: update application status
router.put("/applications/:id/status", auth, requireAdmin, async (req, res) => {
  try {
    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!app) return res.status(404).json({ message: "Application not found" });
    res.json(app);
  } catch (err) {
    res.status(500).json({ message: "Failed to update status", error: err.message });
  }
});

// PUT /api/applications/:id/notes — admin: add internal notes
router.put("/applications/:id/notes", auth, requireAdmin, async (req, res) => {
  try {
    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { notes: req.body.notes },
      { new: true }
    );
    if (!app) return res.status(404).json({ message: "Application not found" });
    res.json(app);
  } catch (err) {
    res.status(500).json({ message: "Failed to update notes", error: err.message });
  }
});

// DELETE /api/applications/:id — job seeker: withdraw application
router.delete("/applications/:id", auth, async (req, res) => {
  try {
    const app = await Application.findOneAndDelete({
      _id: req.params.id,
      applicant: req.user._id,
    });
    if (!app) return res.status(404).json({ message: "Application not found or unauthorized" });
    res.json({ message: "Application withdrawn successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to withdraw application", error: err.message });
  }
});

export default router;
