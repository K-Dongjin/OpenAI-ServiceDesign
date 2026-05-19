export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:4000";

export async function getHealth({ signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/health`, { signal });
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`);
  }
  return response.json();
}
