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
  return Math.max(0, (end - start - (Number(log.breakMinutes) || 0)) / 60);
}

function getWeekKey(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return date.toISOString().slice(0, 10);
}

export function withWorkedHours(log) {
  return {
    ...log,
    workedHours: calculateLogHours(log),
  };
}

export function calculatePayroll({ job, logs, month, actualPaid }) {
  const monthLogs = logs.filter((log) => log.date.startsWith(month));
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
  const expectedPay = basePay + weeklyAllowance;
  const paid = actualPaid === undefined || actualPaid === "" ? null : Number(actualPaid);

  return {
    jobId: job.id,
    month,
    totalHours,
    basePay: Math.round(basePay),
    weeklyAllowance: Math.round(weeklyAllowance),
    expectedPay: Math.round(expectedPay),
    actualPaid: paid,
    difference: paid === null ? null : Math.round(paid - expectedPay),
    notes: [
      "세금, 4대보험, 식대, 지각 및 조퇴 처리에 따라 실제 입금액은 달라질 수 있습니다.",
      "차이가 있으면 급여명세서와 공제 내역을 먼저 확인하세요.",
    ],
  };
}
