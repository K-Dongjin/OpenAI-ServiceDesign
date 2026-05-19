import { Router } from "express";
import { HttpError } from "../middlewares/errorHandler.js";
import {
  createWorkLog,
  deleteWorkLog,
  getJob,
  listWorkLogs,
  updateWorkLog,
} from "../repositories/memoryStore.js";
import { withWorkedHours } from "../services/payrollService.js";
import { validateMonth, validateWorkLogPayload } from "../services/validation.js";

const router = Router();

function requireJob(jobId) {
  const job = getJob(jobId);
  if (!job) {
    throw new HttpError(404, "JOB_NOT_FOUND", "근무 조건을 찾을 수 없습니다.");
  }
  return job;
}

router.get("/jobs/:jobId/work-logs", (req, res) => {
  requireJob(req.params.jobId);
  const { month } = req.query;
  if (month) {
    validateMonth(month, "month");
  }

  const logs = listWorkLogs(req.params.jobId, month).map(withWorkedHours);
  const totalHours = logs.reduce((sum, log) => sum + log.workedHours, 0);
  res.json({ logs, totalHours });
});

router.post("/jobs/:jobId/work-logs", (req, res) => {
  requireJob(req.params.jobId);
  const payload = validateWorkLogPayload(req.body);
  const log = createWorkLog(req.params.jobId, payload);
  res.status(201).json(withWorkedHours(log));
});

router.patch("/work-logs/:logId", (req, res) => {
  const payload = validateWorkLogPayload(req.body, { partial: true });
  const log = updateWorkLog(req.params.logId, payload);
  if (!log) {
    throw new HttpError(404, "WORK_LOG_NOT_FOUND", "근무 기록을 찾을 수 없습니다.");
  }
  res.json(withWorkedHours(log));
});

router.delete("/work-logs/:logId", (req, res) => {
  const deleted = deleteWorkLog(req.params.logId);
  if (!deleted) {
    throw new HttpError(404, "WORK_LOG_NOT_FOUND", "근무 기록을 찾을 수 없습니다.");
  }
  res.status(204).end();
});

export default router;
