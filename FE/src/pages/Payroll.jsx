import { calculatePayroll, formatHours, formatWon } from "../utils/payroll.js";

export default function Payroll({ job, logs, payroll, onChange }) {
  const result = calculatePayroll(logs, job, payroll.month);
  const actualPaid = Number(payroll.actualPaid) || 0;
  const diff = actualPaid ? actualPaid - result.expectedPay : null;

  return (
    <section className="view active" aria-label="급여 확인">
      <section className="calculator-panel">
        <div className="section-heading">
          <p className="eyebrow">급여 확인</p>
          <h2>예상 급여 계산</h2>
        </div>
        <div className="payroll-controls">
          <label>
            확인 월
            <input onChange={(event) => onChange({ month: event.target.value })} type="month" value={payroll.month} />
          </label>
          <label>
            실제 입금액
            <input
              min="0"
              onChange={(event) => onChange({ actualPaid: event.target.value })}
              placeholder="예: 720000"
              step="1000"
              type="number"
              value={payroll.actualPaid}
            />
          </label>
        </div>
        <dl className="payroll-result">
          <div>
            <dt>기록 근무시간</dt>
            <dd>{formatHours(result.totalHours)}</dd>
          </div>
          <div>
            <dt>기본급 추정</dt>
            <dd>{formatWon(result.basePay)}</dd>
          </div>
          <div>
            <dt>주휴수당 추정</dt>
            <dd>{job.weeklyIncluded ? "포함 표시" : formatWon(result.weeklyAllowance)}</dd>
          </div>
          <div className="total-row">
            <dt>예상 합계</dt>
            <dd>{formatWon(result.expectedPay)}</dd>
          </div>
          <div>
            <dt>입금액 차이</dt>
            <dd style={{ color: diff === null ? undefined : diff < 0 ? "var(--danger)" : "var(--ok)" }}>
              {diff === null ? "-" : `${diff > 0 ? "+" : ""}${formatWon(diff)}`}
            </dd>
          </div>
        </dl>
        <p className="support-text">
          세금, 4대보험, 식대, 지각 및 조퇴 처리에 따라 실제 입금액은 달라질 수 있습니다. 차이가 있으면 급여명세서와 공제 내역을 먼저 확인하세요.
        </p>
      </section>
    </section>
  );
}
