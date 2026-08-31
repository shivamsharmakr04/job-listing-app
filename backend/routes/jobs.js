// backend/routes/jobs.js
import express from "express";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import { auth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// GET /api/jobs — public: list all active jobs (with optional search/filter)
router.get("/", async (req, res) => {
  try {
    const { search, type, mode, domain, minSalary, maxSalary } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }
    if (type) filter.type = type;
    if (mode) filter.mode = mode;
    if (domain) filter.domain = { $regex: domain, $options: "i" };
    if (minSalary) filter.maxSalary = { $gte: Number(minSalary) };
    if (maxSalary) filter.minSalary = { ...(filter.minSalary || {}), $lte: Number(maxSalary) };

    const jobs = await Job.find(filter).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch jobs", error: err.message });
  }
});

// GET /api/jobs/:id — public: get single job details
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch job", error: err.message });
  }
});

// POST /api/jobs — admin only: create job
router.post("/", auth, requireAdmin, async (req, res) => {
  try {
    const job = await Job.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: "Failed to create job", error: err.message });
  }
});

// PUT /api/jobs/:id — admin only: update job
router.put("/:id", auth, requireAdmin, async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: "Failed to update job", error: err.message });
  }
});

// DELETE /api/jobs/:id — admin only: delete job
router.delete("/:id", auth, requireAdmin, async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    // also remove all applications for this job
    await Application.deleteMany({ job: req.params.id });
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete job", error: err.message });
  }
});

// POST /api/jobs/:id/apply — logged-in: apply to job
router.post("/:id/apply", auth, async (req, res) => {
  try {
    // Prevent duplicate applications
    const existing = await Application.findOne({
      job: req.params.id,
      applicant: req.user._id,
    });
    if (existing) {
      return res.status(400).json({ message: "You have already applied for this job." });
    }

    const application = await Application.create({
      job: req.params.id,
      applicant: req.user._id,
      coverLetter: req.body.coverLetter || "",
      status: "Applied",
    });
    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ message: "Failed to apply", error: err.message });
  }
});

export default router;
