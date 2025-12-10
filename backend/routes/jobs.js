import express from "express";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import { auth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (_, res) => {
  res.json(await Job.find().sort({ createdAt: -1 }));
});

router.post("/", auth, requireAdmin, async (req, res) => {
  res.json(await Job.create({ ...req.body, createdBy: req.user._id }));
});

router.post("/:id/apply", auth, async (req, res) => {
  const app = await Application.create({
    job: req.params.id,
    applicant: req.user._id
  });
  res.json(app);
});

export default router;
