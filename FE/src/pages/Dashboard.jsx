import CheckList from "../components/CheckList.jsx";
import { formatHours, formatWon, getMonthHours, getThisMonth } from "../utils/payroll.js";

export default function Dashboard({ job, logs, setupChecks }) {
  const weeklyHours = (Number(job.weeklyDays) || 0) * (Number(job.dailyHours) || 0);
  const monthHours = getMonthHours(logs, getThisMonth());

  return (
    <section className="view active" aria-label="홈">
      <div className="dashboard-grid">
        <section className="summary-panel">
          <div className="section-heading">
            <p className="eyebrow">현재 근무지</p>
            <h2>{job.workplace || "아직 입력 전"}</h2>
          </div>
          <dl className="quick-stats">
            <div>
              <dt>시급</dt>
              <dd>{job.hourlyWage ? formatWon(job.hourlyWage) : "-"}</dd>
            </div>
            <div>
              <dt>예정 주 근무</dt>
              <dd>{weeklyHours ? formatHours(weeklyHours) : "-"}</dd>
            </div>
            <div>
              <dt>이번 달 기록</dt>
              <dd>{monthHours ? formatHours(monthHours) : "-"}</dd>
            </div>
          </dl>
        </section>

        <section className="insight-panel">
          <div className="section-heading">
            <p className="eyebrow">오늘 점검</p>
            <h2>놓치기 쉬운 항목</h2>
          </div>
          <CheckList checks={setupChecks.slice(0, 3)} />
        </section>
      </div>

      <section className="timeline-panel">
        <div className="section-heading">
          <p className="eyebrow">서비스 흐름</p>
          <h2>시작 전부터 퇴사 전까지</h2>
        </div>
        <div className="flow-steps">
          <article>
            <span>01</span>
            <strong>근무 조건 입력</strong>
            <p>근무지, 시급, 시작일, 계약서 상태를 저장합니다.</p>
          </article>
          <article>
            <span>02</span>
            <strong>출퇴근 기록</strong>
            <p>날짜별 근무 시간, 휴게시간, 메모를 남깁니다.</p>
          </article>
          <article>
            <span>03</span>
            <strong>급여 차이 확인</strong>
            <p>기록된 시간으로 예상 급여와 실제 입금액을 비교합니다.</p>
          </article>
          <article>
            <span>04</span>
            <strong>상황별 상담</strong>
            <p>계약, 급여, 퇴사 질문에 맞춘 답변 초안을 확인합니다.</p>
          </article>
        </div>
      </section>
    </section>
  );
}
