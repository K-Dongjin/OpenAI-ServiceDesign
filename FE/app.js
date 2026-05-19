const STORAGE_KEY = "alba-rights-ai-state-v1";
const MINIMUM_WAGE_2026 = 10320;

const state = loadState();

const views = {
  dashboard: "홈",
  setup: "알바 시작",
  logs: "근무 기록",
  payroll: "급여 확인",
  chat: "AI 상담",
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function createDefaultState() {
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
        text: "근무 조건과 기록을 바탕으로 계약서, 급여, 퇴사 전 점검 답변 초안을 만들어 드립니다.",
      },
    ],
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? mergeState(createDefaultState(), saved) : createDefaultState();
  } catch {
    return createDefaultState();
  }
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

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatWon(value) {
  return `${Math.round(Number(value) || 0).toLocaleString("ko-KR")}원`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatHours(value) {
  const rounded = Math.round((Number(value) || 0) * 10) / 10;
  return `${rounded.toLocaleString("ko-KR")}시간`;
}

function toMonthInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getThisMonth() {
  return toMonthInput(new Date());
}

function parseTimeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function calculateLogHours(log) {
  let start = parseTimeToMinutes(log.clockIn);
  let end = parseTimeToMinutes(log.clockOut);
  if (end <= start) {
    end += 24 * 60;
  }
  const breakMinutes = Number(log.breakMinutes) || 0;
  return Math.max(0, (end - start - breakMinutes) / 60);
}

function getLogsForMonth(month) {
  return state.logs.filter((log) => log.date.startsWith(month));
}

function getMonthHours(month) {
  return getLogsForMonth(month).reduce((sum, log) => sum + calculateLogHours(log), 0);
}

function getWeekKey(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return date.toISOString().slice(0, 10);
}

function calculatePayroll(month = state.payroll.month) {
  const logs = getLogsForMonth(month);
  const hourlyWage = Number(state.job.hourlyWage) || 0;
  const totalHours = logs.reduce((sum, log) => sum + calculateLogHours(log), 0);
  const basePay = totalHours * hourlyWage;
  const weekHours = logs.reduce((map, log) => {
    const key = getWeekKey(log.date);
    map[key] = (map[key] || 0) + calculateLogHours(log);
    return map;
  }, {});
  const weeklyAllowanceHours = state.job.weeklyIncluded
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

function getSetupChecks() {
  const job = state.job;
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

function renderChecks(target, checks) {
  target.innerHTML = checks
    .map(
      (check) => `
        <li class="check-item ${check.status}">
          <span class="status-dot" aria-hidden="true"></span>
          <div>
            <strong>${check.title}</strong>
            <p>${check.body}</p>
          </div>
        </li>
      `,
    )
    .join("");
}

function renderDashboard() {
  const job = state.job;
  const weeklyHours = (Number(job.weeklyDays) || 0) * (Number(job.dailyHours) || 0);
  const monthHours = getMonthHours(getThisMonth());

  $("#summary-workplace").textContent = job.workplace || "아직 입력 전";
  $("#summary-wage").textContent = job.hourlyWage ? formatWon(job.hourlyWage) : "-";
  $("#summary-weekly-hours").textContent = weeklyHours ? formatHours(weeklyHours) : "-";
  $("#summary-month-hours").textContent = monthHours ? formatHours(monthHours) : "-";
  renderChecks($("#dashboard-checks"), getSetupChecks().slice(0, 3));
}

function renderSetupForm() {
  const job = state.job;
  $("#workplace").value = job.workplace;
  $("#hourly-wage").value = job.hourlyWage;
  $("#minimum-wage").value = job.minimumWage;
  $("#start-date").value = job.startDate;
  $("#pay-day").value = job.payDay;
  $("#weekly-days").value = job.weeklyDays;
  $("#daily-hours").value = job.dailyHours;
  $("#contract-status").value = job.contractStatus;
  $("#weekly-included").checked = Boolean(job.weeklyIncluded);
  renderChecks($("#setup-checks"), getSetupChecks());
}

function renderLogs() {
  const rows = $("#log-rows");
  const sortedLogs = [...state.logs].sort((a, b) => b.date.localeCompare(a.date));
  const totalHours = state.logs.reduce((sum, log) => sum + calculateLogHours(log), 0);
  $("#log-total").textContent = formatHours(totalHours);

  if (!sortedLogs.length) {
    rows.innerHTML = `<tr><td colspan="6" class="empty-state">아직 기록된 근무가 없습니다.</td></tr>`;
    return;
  }

  rows.innerHTML = sortedLogs
    .map(
      (log) => `
        <tr>
          <td>${log.date}</td>
          <td>${log.clockIn} - ${log.clockOut}</td>
          <td>${Number(log.breakMinutes) || 0}분</td>
          <td>${formatHours(calculateLogHours(log))}</td>
          <td>${log.memo ? escapeHtml(log.memo) : "-"}</td>
          <td><button class="delete-button" type="button" data-delete-log="${log.id}">삭제</button></td>
        </tr>
      `,
    )
    .join("");
}

function renderPayroll() {
  $("#payroll-month").value = state.payroll.month;
  $("#actual-paid").value = state.payroll.actualPaid;

  const payroll = calculatePayroll(state.payroll.month);
  const actualPaid = Number(state.payroll.actualPaid) || 0;
  const diff = actualPaid ? actualPaid - payroll.expectedPay : null;

  $("#payroll-hours").textContent = formatHours(payroll.totalHours);
  $("#base-pay").textContent = formatWon(payroll.basePay);
  $("#weekly-pay").textContent = state.job.weeklyIncluded ? "포함 표시" : formatWon(payroll.weeklyAllowance);
  $("#expected-pay").textContent = formatWon(payroll.expectedPay);
  $("#pay-diff").textContent = diff === null ? "-" : `${diff > 0 ? "+" : ""}${formatWon(diff)}`;
  $("#pay-diff").style.color = diff === null ? "" : diff < 0 ? "var(--danger)" : "var(--ok)";
  $("#payroll-note").textContent =
    "세금, 4대보험, 식대, 지각 및 조퇴 처리에 따라 실제 입금액은 달라질 수 있습니다. 차이가 있으면 급여명세서와 공제 내역을 먼저 확인하세요.";
}

function renderChat() {
  const stream = $("#chat-stream");
  stream.innerHTML = state.messages
    .map(
      (message) => `
        <div class="message ${message.role === "user" ? "user" : "bot"}">
          <small>${message.role === "user" ? "나" : "알바권리 AI"}</small>
          ${escapeHtml(message.text)}
        </div>
      `,
    )
    .join("");
  stream.scrollTop = stream.scrollHeight;
}

function renderAll() {
  $("#view-title").textContent = views[state.currentView];
  $$(".nav-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.view === state.currentView));
  $$(".view").forEach((view) => view.classList.toggle("active", view.id === `view-${state.currentView}`));
  renderDashboard();
  renderSetupForm();
  renderLogs();
  renderPayroll();
  renderChat();
}

function switchView(view) {
  state.currentView = view;
  saveState();
  renderAll();
}

function handleJobSubmit(event) {
  event.preventDefault();
  state.job = {
    workplace: $("#workplace").value.trim(),
    hourlyWage: Number($("#hourly-wage").value) || 0,
    minimumWage: Number($("#minimum-wage").value) || MINIMUM_WAGE_2026,
    startDate: $("#start-date").value,
    payDay: Number($("#pay-day").value) || "",
    weeklyDays: Number($("#weekly-days").value) || 0,
    dailyHours: Number($("#daily-hours").value) || 0,
    contractStatus: $("#contract-status").value,
    weeklyIncluded: $("#weekly-included").checked,
  };
  saveState();
  renderAll();
}

function handleLogSubmit(event) {
  event.preventDefault();
  const log = {
    id: crypto.randomUUID(),
    date: $("#log-date").value,
    clockIn: $("#clock-in").value,
    clockOut: $("#clock-out").value,
    breakMinutes: Number($("#break-minutes").value) || 0,
    memo: $("#log-memo").value.trim(),
  };
  state.logs.push(log);
  event.currentTarget.reset();
  $("#log-date").value = new Date().toISOString().slice(0, 10);
  $("#break-minutes").value = 0;
  saveState();
  renderAll();
}

function deleteLog(id) {
  state.logs = state.logs.filter((log) => log.id !== id);
  saveState();
  renderAll();
}

function buildBotReply(text) {
  const normalized = text.toLowerCase();
  const workplace = state.job.workplace || "현재 근무지";
  const payroll = calculatePayroll(state.payroll.month);

  if (normalized.includes("계약") || normalized.includes("근로계약")) {
    return `${workplace} 근무를 시작하기 전에는 근로계약서를 먼저 쓰는 편이 안전합니다. 시급, 근무 요일과 시간, 휴게시간, 임금 지급일, 주휴수당 포함 여부를 확인하고 "근무 조건을 정확히 확인하고 싶어서 계약서를 먼저 작성해도 될까요?"라고 요청해볼 수 있습니다.`;
  }

  if (normalized.includes("월급") || normalized.includes("급여") || normalized.includes("입금")) {
    return `현재 기록 기준 ${state.payroll.month} 예상 급여는 ${formatWon(payroll.expectedPay)}입니다. 실제 입금액과 차이가 있다면 세금, 4대보험, 식대 공제, 지각이나 조퇴 처리 여부를 확인하고 급여명세서를 요청해보세요.`;
  }

  if (normalized.includes("퇴사") || normalized.includes("퇴직금") || normalized.includes("그만")) {
    return "퇴사 전에는 근무 기간, 월별 근무시간, 급여 입금 내역을 먼저 정리하세요. 1년 이상 계속 근무했는지와 주 15시간 이상인 기간이 핵심이 될 수 있으니, 조건이 애매하면 고용노동부 고객상담센터 1350 또는 노동포털 상담으로 연결하는 흐름을 넣는 것이 좋습니다.";
  }

  return "입력한 상황을 계약서, 근무시간, 급여, 퇴사 정산 중 어디에 가까운지 나누어 확인해볼 수 있습니다. 관련 날짜, 시급, 실제 근무시간, 입금액을 함께 적으면 더 구체적인 답변 초안을 만들 수 있습니다.";
}

function handleChatSubmit(event) {
  event.preventDefault();
  const input = $("#chat-input");
  const text = input.value.trim();
  if (!text) return;
  state.messages.push({ role: "user", text });
  state.messages.push({ role: "bot", text: buildBotReply(text) });
  input.value = "";
  saveState();
  renderAll();
}

function bindEvents() {
  $$(".nav-tab").forEach((tab) => {
    tab.addEventListener("click", () => switchView(tab.dataset.view));
  });

  $("#job-form").addEventListener("submit", handleJobSubmit);
  $("#log-form").addEventListener("submit", handleLogSubmit);
  $("#chat-form").addEventListener("submit", handleChatSubmit);

  $("#log-rows").addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-log]");
    if (button) deleteLog(button.dataset.deleteLog);
  });

  $("#payroll-month").addEventListener("change", (event) => {
    state.payroll.month = event.target.value;
    saveState();
    renderPayroll();
  });

  $("#actual-paid").addEventListener("input", (event) => {
    state.payroll.actualPaid = event.target.value;
    saveState();
    renderPayroll();
  });

  $$(".prompt-row button").forEach((button) => {
    button.addEventListener("click", () => {
      $("#chat-input").value = button.dataset.prompt;
      $("#chat-input").focus();
    });
  });

  $("#reset-demo").addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    Object.assign(state, createDefaultState());
    setInitialFormValues();
    renderAll();
  });
}

function setInitialFormValues() {
  $("#log-date").value = new Date().toISOString().slice(0, 10);
  $("#break-minutes").value = 0;
}

bindEvents();
setInitialFormValues();
renderAll();
