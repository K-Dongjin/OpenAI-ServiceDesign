import { calculatePayroll, formatWon } from "./payroll.js";

export function buildBotReply(text, { job, logs, payroll }) {
  const normalized = text.toLowerCase();
  const workplace = job.workplace || "현재 근무지";
  const payrollResult = calculatePayroll(logs, job, payroll.month);

  if (normalized.includes("계약") || normalized.includes("근로계약")) {
    return `${workplace} 근무를 시작하기 전에는 근로계약서를 먼저 쓰는 편이 안전합니다. 시급, 근무 요일과 시간, 휴게시간, 임금 지급일, 주휴수당 포함 여부를 확인하고 "근무 조건을 정확히 확인하고 싶어서 계약서를 먼저 작성해도 될까요?"라고 요청해볼 수 있습니다.`;
  }

  if (normalized.includes("월급") || normalized.includes("급여") || normalized.includes("입금")) {
    return `현재 기록 기준 ${payroll.month} 예상 급여는 ${formatWon(payrollResult.expectedPay)}입니다. 실제 입금액과 차이가 있다면 세금, 4대보험, 식대 공제, 지각이나 조퇴 처리 여부를 확인하고 급여명세서를 요청해보세요.`;
  }

  if (normalized.includes("퇴사") || normalized.includes("퇴직금") || normalized.includes("그만")) {
    return "퇴사 전에는 근무 기간, 월별 근무시간, 급여 입금 내역을 먼저 정리하세요. 1년 이상 계속 근무했는지와 주 15시간 이상인 기간이 핵심이 될 수 있으니, 조건이 애매하면 고용노동부 고객상담센터 1350 또는 노동포털 상담으로 연결하는 흐름을 넣는 것이 좋습니다.";
  }

  return "입력한 상황을 계약서, 근무시간, 급여, 퇴사 정산 중 어디에 가까운지 나누어 확인해볼 수 있습니다. 관련 날짜, 시급, 실제 근무시간, 입금액을 함께 적으면 더 구체적인 답변 초안을 만들 수 있습니다.";
}
