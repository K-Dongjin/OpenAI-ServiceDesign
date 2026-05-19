import { MINIMUM_WAGE_2026, toMonthInput } from "./payroll.js";

export const STORAGE_KEY = "alba-rights-ai-state-v1";

export function createDefaultState() {
  const today = new Date();
  return {
    currentView: "dashboard",
    job: {
      workplace: "",
      hourlyWage: MINIMUM_WAGE_2026,
      minimumWage: MINIMUM_WAGE_2026,
      startDate: "",
      payDay: 25,
      weeklyDays: 3,
      dailyHours: 5,
      contractStatus: "none",
      weeklyIncluded: false,
    },
    logs: [],
    payroll: {
      month: toMonthInput(today),
      actualPaid: "",
    },
    messages: [
      {
        role: "bot",
        text: "근무 조건과 기록을 바탕으로 계약서, 급여, 퇴사 질문에 대한 답변 초안을 만들어 드립니다.",
      },
    ],
  };
}

function mergeState(base, saved) {
  return {
    ...base,
    ...saved,
    job: { ...base.job, ...(saved.job || {}) },
    payroll: { ...base.payroll, ...(saved.payroll || {}) },
    logs: Array.isArray(saved.logs) ? saved.logs : base.logs,
    messages: Array.isArray(saved.messages) ? saved.messages : base.messages,
  };
}

export function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? mergeState(createDefaultState(), saved) : createDefaultState();
  } catch {
    return createDefaultState();
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
