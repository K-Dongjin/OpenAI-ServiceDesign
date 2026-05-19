import { useEffect, useState } from "react";
import CheckList from "../components/CheckList.jsx";
import { MINIMUM_WAGE_2026 } from "../utils/payroll.js";

export default function JobSetup({ job, checks, jobSync, onSave }) {
  const [draft, setDraft] = useState(job);
  const isSaving = jobSync?.status === "saving";

  useEffect(() => {
    setDraft(job);
  }, [job]);

  const updateField = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSave({
      workplace: draft.workplace.trim(),
      hourlyWage: Number(draft.hourlyWage) || 0,
      minimumWage: Number(draft.minimumWage) || MINIMUM_WAGE_2026,
      startDate: draft.startDate,
      payDay: Number(draft.payDay) || "",
      weeklyDays: Number(draft.weeklyDays) || 0,
      dailyHours: Number(draft.dailyHours) || 0,
      contractStatus: draft.contractStatus,
      weeklyIncluded: Boolean(draft.weeklyIncluded),
    });
  };

  return (
    <section className="view active" aria-label="알바 시작">
      <form className="form-panel" onSubmit={handleSubmit}>
        <div className="section-heading">
          <p className="eyebrow">기본 정보</p>
          <h2>근무 조건</h2>
        </div>
        <div className="form-grid">
          <label>
            근무지
            <input
              onChange={(event) => updateField("workplace", event.target.value)}
              placeholder="예: 카페 오후 알바"
              type="text"
              value={draft.workplace}
            />
          </label>
          <label>
            시급
            <input
              min="0"
              onChange={(event) => updateField("hourlyWage", event.target.value)}
              step="10"
              type="number"
              value={draft.hourlyWage}
            />
          </label>
          <label>
            최저임금 기준
            <input
              min="0"
              onChange={(event) => updateField("minimumWage", event.target.value)}
              step="10"
              type="number"
              value={draft.minimumWage}
            />
          </label>
          <label>
            근무 시작일
            <input
              onChange={(event) => updateField("startDate", event.target.value)}
              type="date"
              value={draft.startDate}
            />
          </label>
          <label>
            급여일
            <input
              max="31"
              min="1"
              onChange={(event) => updateField("payDay", event.target.value)}
              type="number"
              value={draft.payDay}
            />
          </label>
          <label>
            주 근무일
            <input
              max="7"
              min="1"
              onChange={(event) => updateField("weeklyDays", event.target.value)}
              step="1"
              type="number"
              value={draft.weeklyDays}
            />
          </label>
          <label>
            하루 근무시간
            <input
              max="24"
              min="0"
              onChange={(event) => updateField("dailyHours", event.target.value)}
              step="0.5"
              type="number"
              value={draft.dailyHours}
            />
          </label>
          <label>
            근로계약서
            <select
              onChange={(event) => updateField("contractStatus", event.target.value)}
              value={draft.contractStatus}
            >
              <option value="none">아직 작성 전</option>
              <option value="planned">작성 예정</option>
              <option value="signed">작성 완료</option>
            </select>
          </label>
        </div>
        <label className="inline-toggle">
          <input
            checked={draft.weeklyIncluded}
            onChange={(event) => updateField("weeklyIncluded", event.target.checked)}
            type="checkbox"
          />
          시급에 주휴수당 포함이라고 안내받음
        </label>
        {jobSync?.message && (
          <p className={`sync-note ${jobSync.status}`} role={jobSync.status === "error" ? "alert" : "status"}>
            {jobSync.message}
          </p>
        )}
        <div className="form-actions">
          <button className="primary-button" disabled={isSaving} type="submit">
            {isSaving ? "저장 중" : "저장"}
          </button>
        </div>
      </form>

      <section className="check-panel">
        <div className="section-heading">
          <p className="eyebrow">자동 점검</p>
          <h2>시작 전 체크리스트</h2>
        </div>
        <CheckList checks={checks} />
      </section>
    </section>
  );
}
