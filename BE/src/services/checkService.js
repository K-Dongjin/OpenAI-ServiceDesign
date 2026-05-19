import { MINIMUM_WAGE_2026 } from "./minimumWageService.js";

function formatWon(value) {
  return `${Math.round(Number(value) || 0).toLocaleString("ko-KR")}원`;
}

function formatHours(value) {
  const rounded = Math.round((Number(value) || 0) * 10) / 10;
  return `${rounded.toLocaleString("ko-KR")}시간`;
}

export function buildSetupChecks(job) {
  const weeklyHours = (Number(job.weeklyDays) || 0) * (Number(job.dailyHours) || 0);
  const hourlyWage = Number(job.hourlyWage) || 0;
  const minimumWage = Number(job.minimumWage) || MINIMUM_WAGE_2026;
  const breakMinutes = Number(job.dailyHours) >= 8 ? 60 : Number(job.dailyHours) >= 4 ? 30 : 0;

  return [
    {
      status: job.contractStatus === "signed" ? "ok" : job.contractStatus === "planned" ? "warn" : "danger",
      title: "근로계약서",
      body:
        job.contractStatus === "signed"
          ? "계약서 작성 완료로 표시되어 있습니다."
          : "시급, 근무시간, 휴게시간, 임금 지급일, 주휴수당 포함 여부를 먼저 확인하세요.",
    },
    {
      status: hourlyWage >= minimumWage ? "ok" : "danger",
      title: "최저임금 비교",
      body:
        hourlyWage >= minimumWage
          ? `입력한 시급은 기준 시급 ${formatWon(minimumWage)} 이상입니다.`
          : `입력한 시급이 기준 시급 ${formatWon(minimumWage)}보다 낮습니다.`,
    },
    {
      status: weeklyHours >= 15 ? "warn" : "ok",
      title: "주휴수당 가능성",
      body:
        weeklyHours >= 15
          ? `예정 근무가 주 ${formatHours(weeklyHours)}입니다. 주휴수당 포함 여부와 개근 조건을 확인하세요.`
          : `예정 근무가 주 ${formatHours(weeklyHours)}로 입력되어 있습니다.`,
    },
    {
      status: breakMinutes > 0 ? "warn" : "ok",
      title: "휴게시간",
      body:
        breakMinutes > 0
          ? `하루 ${formatHours(job.dailyHours)} 근무라면 최소 ${breakMinutes}분 휴게시간을 따로 기록하세요.`
          : "입력한 하루 근무시간 기준으로 별도 휴게시간 점검은 낮은 우선순위입니다.",
    },
    {
      status: job.payDay ? "ok" : "warn",
      title: "급여 지급일",
      body: job.payDay ? `매월 ${job.payDay}일 지급으로 저장되어 있습니다.` : "급여 지급일을 계약서와 함께 확인하세요.",
    },
  ];
}
