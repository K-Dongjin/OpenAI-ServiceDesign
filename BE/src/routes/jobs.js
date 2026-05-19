import { Router } from "express";
import { HttpError } from "../middlewares/errorHandler.js";
import { createJob, deleteJob, getJob, listJobs, updateJob } from "../repositories/memoryStore.js";
import { validateJobPayload } from "../services/validation.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({ jobs: listJobs() });
});

router.post("/", (req, res) => {
  const payload = validateJobPayload(req.body);
  const job = createJob(payload);
  res.status(201).json(job);
});

router.get("/:jobId", (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) {
    throw new HttpError(404, "JOB_NOT_FOUND", "근무 조건을 찾을 수 없습니다.");
  }
  res.json(job);
});

router.patch("/:jobId", (req, res) => {
  const payload = validateJobPayload(req.body, { partial: true });
  const job = updateJob(req.params.jobId, payload);
  if (!job) {
    throw new HttpError(404, "JOB_NOT_FOUND", "근무 조건을 찾을 수 없습니다.");
  }
  res.json(job);
});

router.delete("/:jobId", (req, res) => {
  const deleted = deleteJob(req.params.jobId);
  if (!deleted) {
    throw new HttpError(404, "JOB_NOT_FOUND", "근무 조건을 찾을 수 없습니다.");
  }
  res.status(204).end();
});

export default router;
