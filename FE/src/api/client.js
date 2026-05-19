export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:4000";

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.error?.message || `API request failed: ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.details = data?.error?.details || [];
    throw error;
  }

  return data;
}

function jobPath(jobId) {
  return `/api/v1/jobs/${encodeURIComponent(jobId)}`;
}

export async function getHealth({ signal } = {}) {
  return requestJson("/health", { signal });
}

export async function listJobs({ signal } = {}) {
  return requestJson("/api/v1/jobs", { signal });
}

export async function createJob(payload, { signal } = {}) {
  return requestJson("/api/v1/jobs", {
    method: "POST",
    body: JSON.stringify(payload),
    signal,
  });
}

export async function updateJob(jobId, payload, { signal } = {}) {
  return requestJson(jobPath(jobId), {
    method: "PATCH",
    body: JSON.stringify(payload),
    signal,
  });
}

export async function deleteJob(jobId, { signal } = {}) {
  return requestJson(jobPath(jobId), {
    method: "DELETE",
    signal,
  });
}
