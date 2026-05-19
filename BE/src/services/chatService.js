import { createId, now } from "../repositories/memoryStore.js";
import { calculatePayroll } from "./payrollService.js";

function formatWon(value) {
  return `${Math.round(Number(value) || 0).toLocaleString("ko-KR")}원`;
}

export function buildChatResponse({ job, logs, month, text }) {
  const normalized = text.toLowerCase();
  const workplace = job?.workplace || "현재 근무지";
  const payroll = job ? calculatePayroll({ job, logs, month }) : null;

  if (normalized.includes("계약") || normalized.includes("근로계약")) {
    return {
      text: `${workplace} 근무를 시작하기 전에는 근로계약서를 먼저 쓰는 편이 안전합니다. 시급, 근무시간, 휴게시간, 임금 지급일, 주휴수당 포함 여부를 확인하세요.`,
      recommendedActions: ["근로계약서 작성 요청", "시급과 주휴수당 포함 여부 확인"],
    };
  }

  if (normalized.includes("월급") || normalized.includes("급여") || normalized.includes("입금")) {
    return {
      text: `현재 기록 기준 ${month} 예상 급여는 ${payroll ? formatWon(payroll.expectedPay) : "계산 전"}입니다. 실제 입금액과 차이가 있다면 급여명세서와 공제 내역을 확인하세요.`,
      recommendedActions: ["급여명세서 요청", "공제 내역 확인"],
    };
  }

  if (normalized.includes("퇴사") || normalized.includes("퇴직금") || normalized.includes("그만")) {
    return {
      text: "퇴사 전에는 근무 기간, 월별 근무시간, 급여 입금 내역을 먼저 정리하세요. 조건이 애매하면 고용노동부 상담을 받아보는 것이 좋습니다.",
      recommendedActions: ["월별 근무시간 정리", "급여 입금 내역 정리", "고용노동부 상담 검토"],
    };
  }

  return {
    text: "입력한 상황을 계약서, 근무시간, 급여, 퇴사 정산 중 어디에 가까운지 나누어 확인해볼 수 있습니다. 날짜, 시급, 실제 근무시간, 입금액을 함께 적으면 더 구체적인 답변을 만들 수 있습니다.",
    recommendedActions: ["상황 유형 정리", "근무 조건과 금액 함께 입력"],
  };
}

export function createChatMessages({ jobId, userText, assistantText }) {
  const userMessage = {
    id: createId("msg"),
    jobId,
    role: "user",
    text: userText,
    createdAt: now(),
  };
  const assistantMessage = {
    id: createId("msg"),
    jobId,
    role: "assistant",
    text: assistantText,
    createdAt: now(),
  };
  return { userMessage, assistantMessage };
}
