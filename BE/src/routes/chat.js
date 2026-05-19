import { Router } from "express";
import { HttpError } from "../middlewares/errorHandler.js";
import { addMessages, getJob, listMessages, listWorkLogs } from "../repositories/memoryStore.js";
import { buildChatResponse, createChatMessages } from "../services/chatService.js";

const router = Router();

router.post("/messages", (req, res) => {
  const { jobId, message, context = {} } = req.body;
  if (!message || typeof message !== "string") {
    throw new HttpError(400, "VALIDATION_ERROR", "입력값을 확인하세요.", [
      { field: "message", message: "메시지는 필수 문자열입니다." },
    ]);
  }

  const job = jobId ? getJob(jobId) : null;
  if (jobId && !job) {
    throw new HttpError(404, "JOB_NOT_FOUND", "근무 조건을 찾을 수 없습니다.");
  }

  const month = context.month || new Date().toISOString().slice(0, 7);
  const logs = job ? listWorkLogs(job.id, month) : [];
  const assistant = buildChatResponse({ job, logs, month, text: message });
  const { userMessage, assistantMessage } = createChatMessages({
    jobId,
    userText: message,
    assistantText: assistant.text,
  });
  addMessages([userMessage, assistantMessage]);

  res.status(201).json({
    userMessage,
    assistantMessage,
    recommendedActions: assistant.recommendedActions,
    officialLinks: [
      {
        label: "고용노동부 고객상담센터",
        url: "https://1350.moel.go.kr/",
      },
    ],
  });
});

router.get("/messages", (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  res.json({
    messages: listMessages({ jobId: req.query.jobId, limit }),
  });
});

export default router;
