import { HttpError } from "../middlewares/errorHandler.js";

export const CONTRACT_STATUSES = new Set(["none", "planned", "signed"]);

export function assert(condition, field, message) {
  if (!condition) {
    throw new HttpError(400, "VALIDATION_ERROR", "입력값을 확인하세요.", [{ field, message }]);
  }
}

function validateObjectPayload(payload) {
  assert(
    payload && typeof payload === "object" && !Array.isArray(payload),
    "body",
    "요청 본문은 JSON 객체여야 합니다.",
  );
  return payload;
}

export function validateDate(value, field) {
  assert(typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value), field, "날짜는 YYYY-MM-DD 형식이어야 합니다.");
}

export function validateMonth(value, field) {
  assert(typeof value === "string" && /^\d{4}-\d{2}$/.test(value), field, "월은 YYYY-MM 형식이어야 합니다.");
}

export function validateTime(value, field) {
  assert(typeof value === "string" && /^\d{2}:\d{2}$/.test(value), field, "시간은 HH:mm 형식이어야 합니다.");
}

export function validateJobPayload(payload, { partial = false } = {}) {
  payload = validateObjectPayload(payload);
  const data = {};

  if (!partial || "workplace" in payload) {
    assert(typeof payload.workplace === "string", "workplace", "근무지는 문자열이어야 합니다.");
    data.workplace = payload.workplace.trim();
  }
  if (!partial || "hourlyWage" in payload) {
    data.hourlyWage = Number(payload.hourlyWage);
    assert(Number.isFinite(data.hourlyWage) && data.hourlyWage >= 0, "hourlyWage", "시급은 0 이상이어야 합니다.");
  }
  if (!partial || "minimumWage" in payload) {
    data.minimumWage = Number(payload.minimumWage);
    assert(Number.isFinite(data.minimumWage) && data.minimumWage >= 0, "minimumWage", "최저임금 기준은 0 이상이어야 합니다.");
  }
  if (!partial || "startDate" in payload) {
    if (payload.startDate) validateDate(payload.startDate, "startDate");
    data.startDate = payload.startDate || "";
  }
  if (!partial || "payDay" in payload) {
    data.payDay = Number(payload.payDay);
    assert(Number.isInteger(data.payDay) && data.payDay >= 1 && data.payDay <= 31, "payDay", "급여일은 1부터 31 사이여야 합니다.");
  }
  if (!partial || "weeklyDays" in payload) {
    data.weeklyDays = Number(payload.weeklyDays);
    assert(Number.isInteger(data.weeklyDays) && data.weeklyDays >= 1 && data.weeklyDays <= 7, "weeklyDays", "주 근무일은 1부터 7 사이여야 합니다.");
  }
  if (!partial || "dailyHours" in payload) {
    data.dailyHours = Number(payload.dailyHours);
    assert(Number.isFinite(data.dailyHours) && data.dailyHours >= 0 && data.dailyHours <= 24, "dailyHours", "하루 근무시간은 0부터 24 사이여야 합니다.");
  }
  if (!partial || "contractStatus" in payload) {
    assert(CONTRACT_STATUSES.has(payload.contractStatus), "contractStatus", "근로계약서 상태가 올바르지 않습니다.");
    data.contractStatus = payload.contractStatus;
  }
  if (!partial || "weeklyIncluded" in payload) {
    data.weeklyIncluded = Boolean(payload.weeklyIncluded);
  }

  if (partial) {
    assert(Object.keys(data).length > 0, "body", "수정할 근무 조건을 하나 이상 입력하세요.");
  }

  return data;
}

export function validateWorkLogPayload(payload, { partial = false } = {}) {
  payload = validateObjectPayload(payload);
  const data = {};

  if (!partial || "date" in payload) {
    validateDate(payload.date, "date");
    data.date = payload.date;
  }
  if (!partial || "clockIn" in payload) {
    validateTime(payload.clockIn, "clockIn");
    data.clockIn = payload.clockIn;
  }
  if (!partial || "clockOut" in payload) {
    validateTime(payload.clockOut, "clockOut");
    data.clockOut = payload.clockOut;
  }
  if (!partial || "breakMinutes" in payload) {
    data.breakMinutes = Number(payload.breakMinutes) || 0;
    assert(Number.isInteger(data.breakMinutes) && data.breakMinutes >= 0, "breakMinutes", "휴게시간은 0 이상 정수여야 합니다.");
  }
  if (!partial || "memo" in payload) {
    data.memo = typeof payload.memo === "string" ? payload.memo.trim() : "";
  }

  if (partial) {
    assert(Object.keys(data).length > 0, "body", "수정할 근무 기록을 하나 이상 입력하세요.");
  }

  return data;
}
