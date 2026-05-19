export const MINIMUM_WAGE_2026 = 10320;

export function formatWon(value) {
  return `${Math.round(Number(value) || 0).toLocaleString("ko-KR")}원`;
}

export function formatHours(value) {
  const rounded = Math.round((Number(value) || 0) * 10) / 10;
  return `${rounded.toLocaleString("ko-KR")}시간`;
}

export function toMonthInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function getThisMonth() {
  return toMonthInput(new Date());
}

function parseTimeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function calculateLogHours(log) {
  let start = parseTimeToMinutes(log.clockIn);
  let end = parseTimeToMinutes(log.clockOut);
  if (end <= start) {
    end += 24 * 60;
  }
  const breakMinutes = Number(log.breakMinutes) || 0;
  return Math.max(0, (end - start - breakMinutes) / 60);
}

export function getLogsForMonth(logs, month) {
  return logs.filter((log) => log.date.startsWith(month));
}

export function getMonthHours(logs, month) {
  return getLogsForMonth(logs, month).reduce((sum, log) => sum + calculateLogHours(log), 0);
}

function getWeekKey(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return date.toISOString().slice(0, 10);
}

export function calculatePayroll(logs, job, month) {
  const monthLogs = getLogsForMonth(logs, month);
  const hourlyWage = Number(job.hourlyWage) || 0;
  const totalHours = monthLogs.reduce((sum, log) => sum + calculateLogHours(log), 0);
  const basePay = totalHours * hourlyWage;
  const weekHours = monthLogs.reduce((map, log) => {
    const key = getWeekKey(log.date);
    map[key] = (map[key] || 0) + calculateLogHours(log);
    return map;
  }, {});
  const weeklyAllowanceHours = job.weeklyIncluded
    ? 0
    : Object.values(weekHours).reduce((sum, hours) => {
        if (hours < 15) return sum;
        return sum + Math.min(8, hours / 5);
      }, 0);
  const weeklyAllowance = weeklyAllowanceHours * hourlyWage;
  return {
    totalHours,
    basePay,
    weeklyAllowance,
    expectedPay: basePay + weeklyAllowance,
  };
}

export function getSetupChecks(job) {
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
