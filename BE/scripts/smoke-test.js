import app from "../src/app.js";

function listen() {
  return new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

async function request(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`${options.method || "GET"} ${path} failed: ${response.status} ${text}`);
  }
  return body;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const { server, baseUrl } = await listen();

try {
  const health = await request(baseUrl, "/health");
  assert(health.status === "ok", "health response should be ok");

  const job = await request(baseUrl, "/api/v1/jobs", {
    method: "POST",
    body: JSON.stringify({
      workplace: "카페 오후 알바",
      hourlyWage: 10320,
      minimumWage: 10320,
      startDate: "2026-05-19",
      payDay: 25,
      weeklyDays: 3,
      dailyHours: 5,
      contractStatus: "none",
      weeklyIncluded: false,
    }),
  });
  assert(job.id, "created job should include id");

  const jobs = await request(baseUrl, "/api/v1/jobs");
  assert(jobs.jobs.length === 1, "jobs list should include created job");

  const log = await request(baseUrl, `/api/v1/jobs/${job.id}/work-logs`, {
    method: "POST",
    body: JSON.stringify({
      date: "2026-05-20",
      clockIn: "18:00",
      clockOut: "23:30",
      breakMinutes: 30,
      memo: "30분 연장",
    }),
  });
  assert(log.workedHours === 5, "work log should calculate workedHours");

  const payroll = await request(baseUrl, `/api/v1/jobs/${job.id}/payroll?month=2026-05&actualPaid=50000`);
  assert(payroll.expectedPay === 51600, "payroll should calculate expected pay");

  const checks = await request(baseUrl, `/api/v1/jobs/${job.id}/checks`);
  assert(checks.checks.length > 0, "checks should not be empty");

  const chat = await request(baseUrl, "/api/v1/chat/messages", {
    method: "POST",
    body: JSON.stringify({
      jobId: job.id,
      message: "계약서는 다음 주에 써도 괜찮아?",
      context: { month: "2026-05" },
    }),
  });
  assert(chat.assistantMessage.role === "assistant", "chat should return assistant message");

  const references = await request(baseUrl, "/api/v1/references/minimum-wages?year=2026");
  assert(references.items[0].hourlyWage === 10320, "minimum wage reference should include 2026 value");

  console.log("BE smoke test passed");
} finally {
  server.close();
}
