export default function Topbar({ health, title, onReset }) {
  return (
    <section className="topbar">
      <div>
        <p className="eyebrow">FE prototype</p>
        <h1>{title}</h1>
      </div>
      <div className="topbar-actions">
        <span className={`health-badge ${health.status}`} title={health.service || health.message}>
          <span className="health-dot" aria-hidden="true" />
          {health.message}
        </span>
        <button id="reset-demo" className="ghost-button" onClick={onReset} type="button">
          초기화
        </button>
      </div>
    </section>
  );
}
