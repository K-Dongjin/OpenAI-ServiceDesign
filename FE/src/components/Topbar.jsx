export default function Topbar({ title, onReset }) {
  return (
    <section className="topbar">
      <div>
        <p className="eyebrow">FE prototype</p>
        <h1>{title}</h1>
      </div>
      <button id="reset-demo" className="ghost-button" onClick={onReset} type="button">
        초기화
      </button>
    </section>
  );
}
