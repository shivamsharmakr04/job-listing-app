import express from "express";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import { auth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/applications", auth, async (req, res) => {
  res.json(await Application.find({ applicant: req.user._id }).populate("job"));
});

router.get("/employer/applications", auth, requireAdmin, async (req, res) => {
  const jobs = await Job.find({ createdBy: req.user._id });
  res.json(await Application.find({ job: { $in: jobs.map(j => j._id) } })
    .populate("job")
    .populate("applicant", "name email"));
});

router.put("/applications/:id/status", auth, requireAdmin, async (req, res) => {
  res.json(
    await Application.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    )
  );
});

export default router;
