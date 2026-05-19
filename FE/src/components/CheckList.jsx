export default function CheckList({ checks }) {
  return (
    <ul className="check-list">
      {checks.map((check) => (
        <li className={`check-item ${check.status}`} key={check.title}>
          <span className="status-dot" aria-hidden="true" />
          <div>
            <strong>{check.title}</strong>
            <p>{check.body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
