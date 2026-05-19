import { useState } from "react";
import { calculateLogHours, formatHours } from "../utils/payroll.js";

const initialForm = {
  date: new Date().toISOString().slice(0, 10),
  clockIn: "",
  clockOut: "",
  breakMinutes: 0,
  memo: "",
};

export default function WorkLogs({ job, logSync, logs, onAddLog, onDeleteLog }) {
  const [form, setForm] = useState(initialForm);
  const isSaving = logSync?.status === "saving";
  const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  const totalHours = logs.reduce((sum, log) => sum + calculateLogHours(log), 0);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const saved = await onAddLog({
      date: form.date,
      clockIn: form.clockIn,
      clockOut: form.clockOut,
      breakMinutes: Number(form.breakMinutes) || 0,
      memo: form.memo.trim(),
    });
    if (saved !== false) {
      setForm(initialForm);
    }
  };

  return (
    <section className="view active" aria-label="근무 기록">
      <form className="form-panel compact" onSubmit={handleSubmit}>
        <div className="section-heading">
          <p className="eyebrow">근무 중</p>
          <h2>출퇴근 기록</h2>
        </div>
        <div className="form-grid log-grid">
          <label>
            날짜
            <input onChange={(event) => updateField("date", event.target.value)} required type="date" value={form.date} />
          </label>
          <label>
            출근
            <input
              onChange={(event) => updateField("clockIn", event.target.value)}
              required
              type="time"
              value={form.clockIn}
            />
          </label>
          <label>
            퇴근
            <input
              onChange={(event) => updateField("clockOut", event.target.value)}
              required
              type="time"
              value={form.clockOut}
            />
          </label>
          <label>
            휴게시간(분)
            <input
              min="0"
              onChange={(event) => updateField("breakMinutes", event.target.value)}
              step="10"
              type="number"
              value={form.breakMinutes}
            />
          </label>
          <label className="wide-field">
            메모
            <input
              onChange={(event) => updateField("memo", event.target.value)}
              placeholder="예: 30분 연장, 대타 근무"
              type="text"
              value={form.memo}
            />
          </label>
        </div>
        {logSync?.message && (
          <p className={`sync-note ${logSync.status}`} role={logSync.status === "error" ? "alert" : "status"}>
            {logSync.message}
          </p>
        )}
        <div className="form-actions">
          <button className="primary-button" disabled={isSaving} type="submit">
            {isSaving ? "저장 중" : job.id ? "BE에 기록 추가" : "기록 추가"}
          </button>
        </div>
      </form>

      <section className="table-panel">
        <div className="table-header">
          <div>
            <p className="eyebrow">기록 목록</p>
            <h2>근무 내역</h2>
          </div>
          <strong>{formatHours(totalHours)}</strong>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>날짜</th>
                <th>시간</th>
                <th>휴게</th>
                <th>인정 시간</th>
                <th>메모</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {!sortedLogs.length && (
                <tr>
                  <td className="empty-state" colSpan="6">
                    아직 기록된 근무가 없습니다.
                  </td>
                </tr>
              )}
              {sortedLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.date}</td>
                  <td>
                    {log.clockIn} - {log.clockOut}
                  </td>
                  <td>{Number(log.breakMinutes) || 0}분</td>
                  <td>{formatHours(calculateLogHours(log))}</td>
                  <td>{log.memo || "-"}</td>
                  <td>
                    <button
                      className="delete-button"
                      disabled={isSaving}
                      onClick={() => onDeleteLog(log.id)}
                      type="button"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
