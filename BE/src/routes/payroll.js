import { Router } from "express";
import { HttpError } from "../middlewares/errorHandler.js";
import { getJob, listWorkLogs } from "../repositories/memoryStore.js";
import { buildSetupChecks } from "../services/checkService.js";
import { calculatePayroll } from "../services/payrollService.js";
import { validateMonth, validateWorkLogPayload } from "../services/validation.js";

const router = Router();

function requireJob(jobId) {
  const job = getJob(jobId);
  if (!job) {
    throw new HttpError(404, "JOB_NOT_FOUND", "근무 조건을 찾을 수 없습니다.");
  }
  return job;
}

router.get("/jobs/:jobId/checks", (req, res) => {
  const job = requireJob(req.params.jobId);
  res.json({
    jobId: job.id,
    checks: buildSetupChecks(job),
  });
});

router.get("/jobs/:jobId/payroll", (req, res) => {
  const job = requireJob(req.params.jobId);
  const { month, actualPaid } = req.query;
  validateMonth(month, "month");
  const logs = listWorkLogs(job.id, month);
  res.json(calculatePayroll({ job, logs, month, actualPaid }));
});

router.post("/payroll/preview", (req, res) => {
  const { job, logs = [], month, actualPaid } = req.body;
  if (!job) {
    throw new HttpError(400, "VALIDATION_ERROR", "입력값을 확인하세요.", [
      { field: "job", message: "급여 계산에 사용할 근무 조건이 필요합니다." },
    ]);
  }
  validateMonth(month, "month");
  const normalizedLogs = logs.map((log) => validateWorkLogPayload(log));

  res.json(
    calculatePayroll({
      job: {
        id: "preview",
        hourlyWage: Number(job.hourlyWage) || 0,
        weeklyIncluded: Boolean(job.weeklyIncluded),
      },
      logs: normalizedLogs,
      month,
      actualPaid,
    }),
  );
});

export default router;
