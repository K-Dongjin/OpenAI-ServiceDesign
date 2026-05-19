const jobs = new Map();
const workLogs = new Map();
const messages = [];

function createId(prefix) {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}_${globalThis.crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function now() {
  return new Date().toISOString();
}

export function listJobs() {
  return Array.from(jobs.values());
}

export function getJob(jobId) {
  return jobs.get(jobId) || null;
}

export function createJob(data) {
  const createdAt = now();
  const job = {
    id: createId("job"),
    ...data,
    createdAt,
    updatedAt: createdAt,
  };
  jobs.set(job.id, job);
  return job;
}

export function updateJob(jobId, patch) {
  const current = getJob(jobId);
  if (!current) return null;

  const updated = {
    ...current,
    ...patch,
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: now(),
  };
  jobs.set(jobId, updated);
  return updated;
}

export function deleteJob(jobId) {
  if (!jobs.has(jobId)) return false;
  jobs.delete(jobId);
  for (const [logId, log] of workLogs.entries()) {
    if (log.jobId === jobId) {
      workLogs.delete(logId);
    }
  }
  return true;
}

export function listWorkLogs(jobId, month) {
  return Array.from(workLogs.values())
    .filter((log) => log.jobId === jobId)
    .filter((log) => (month ? log.date.startsWith(month) : true))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getWorkLog(logId) {
  return workLogs.get(logId) || null;
}

export function createWorkLog(jobId, data) {
  const createdAt = now();
  const log = {
    id: createId("log"),
    jobId,
    ...data,
    createdAt,
    updatedAt: createdAt,
  };
  workLogs.set(log.id, log);
  return log;
}

export function updateWorkLog(logId, patch) {
  const current = getWorkLog(logId);
  if (!current) return null;

  const updated = {
    ...current,
    ...patch,
    id: current.id,
    jobId: current.jobId,
    createdAt: current.createdAt,
    updatedAt: now(),
  };
  workLogs.set(logId, updated);
  return updated;
}

export function deleteWorkLog(logId) {
  return workLogs.delete(logId);
}

export function addMessages(items) {
  messages.push(...items);
  return items;
}

export function listMessages({ jobId, limit = 50 } = {}) {
  return messages
    .filter((message) => (jobId ? message.jobId === jobId : true))
    .slice(-limit);
}

export { createId, now };
