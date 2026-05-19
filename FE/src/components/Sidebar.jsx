export default function Sidebar({ currentView, views, onSwitchView }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">A</div>
        <div>
          <strong>알바권리 AI</strong>
          <span>근무 기록과 권리 점검</span>
        </div>
      </div>

      <nav className="nav-tabs" aria-label="주요 화면">
        {Object.entries(views).map(([view, label]) => (
          <button
            className={`nav-tab ${currentView === view ? "active" : ""}`}
            data-view={view}
            key={view}
            onClick={() => onSwitchView(view)}
            type="button"
          >
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
