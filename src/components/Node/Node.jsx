import "./Node.css";

const IconMessage = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const IconFlag = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);

const IconCheck = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

export default function Node({ node, isSelected, onSelect, onUpdateNode }) {
  const { id, type, text, position, options } = node;

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(id);
  };

  return (
    <div
      className={`node node--${type} ${isSelected ? "node--selected" : ""}`}
      style={{ left: position.x, top: position.y }}
      onClick={handleClick}
      data-node-id={id}
    >
      {/* ── Top connector dot (input) — not on start nodes ── */}
      {type !== "start" && (
        <div
          className="node__connector node__connector--in"
          data-connector="in"
        />
      )}

      {/* ── Header ── */}
      <div className="node__header">
        <div className={`node__icon node__icon--${type}`}>
          {type === "start" && <IconFlag />}
          {type === "question" && <IconMessage />}
          {type === "end" && <IconCheck />}
        </div>
        <span className="node__type-label">{type}</span>
        {isSelected && <div className="node__selected-dot" />}
      </div>

      {/* ── Body ── */}
      <div className="node__body">
        <p className="node__text">{text}</p>
      </div>

      {/* ── Options / Output connectors ── */}
      {options && options.length > 0 && (
        <div className="node__options">
          {options.map((opt, idx) => (
            <div key={idx} className="node__option" data-option-index={idx}>
              <span className="node__option-label">{opt.label}</span>
              <div
                className="node__connector node__connector--out"
                data-connector="out"
                data-option-index={idx}
                data-next-id={opt.nextId}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── End node bottom connector dot ── */}
      {type === "end" && (
        <div className="node__end-badge">
          <IconCheck />
          <span>End of flow</span>
        </div>
      )}
    </div>
  );
}
