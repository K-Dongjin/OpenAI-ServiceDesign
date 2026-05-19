import cors from "cors";
import express from "express";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import chatRouter from "./routes/chat.js";
import healthRouter from "./routes/health.js";
import jobsRouter from "./routes/jobs.js";
import payrollRouter from "./routes/payroll.js";
import referencesRouter from "./routes/references.js";
import workLogsRouter from "./routes/workLogs.js";

const app = express();

app.use(
  cors({
    origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
  }),
);
app.use(express.json());

app.use(healthRouter);
app.use("/api/v1/jobs", jobsRouter);
app.use("/api/v1", workLogsRouter);
app.use("/api/v1", payrollRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/references", referencesRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
