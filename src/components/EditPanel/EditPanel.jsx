import { useState, useEffect } from "react";
import "./EditPanel.css";

const IconClose = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconTrash = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <polyline points="3,6 5,6 21,6" />
    <path d="M19,6l-1,14a2 2 0 0 1-2,2H8a2 2 0 0 1-2-2L5,6" />
    <path d="M10,11v6" />
    <path d="M14,11v6" />
    <path d="M9,6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1,1v2" />
  </svg>
);

const IconPlus = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconLink = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

function NodeIdBadge({ type }) {
  const colors = {
    start: "var(--node-start-color)",
    question: "var(--node-question-color)",
    end: "var(--node-end-color)",
  };
  return (
    <span
      className="edit-panel__type-badge"
      style={{ "--badge-color": colors[type] }}
    >
      {type}
    </span>
  );
}

export default function EditPanel({ node, onClose, onUpdate, allNodes }) {
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    if (node) setDraft(JSON.parse(JSON.stringify(node)));
    else setDraft(null);
  }, [node]);

  // ── return null when nothing selected — no empty panel rendered ──
  if (!node || !draft) return null;

  const handleTextChange = (e) => {
    const updated = { ...draft, text: e.target.value };
    setDraft(updated);
    onUpdate(updated);
  };

  const handleOptionLabelChange = (idx, value) => {
    const options = draft.options.map((o, i) =>
      i === idx ? { ...o, label: value } : o,
    );
    const updated = { ...draft, options };
    setDraft(updated);
    onUpdate(updated);
  };

  const handleOptionNextChange = (idx, value) => {
    const options = draft.options.map((o, i) =>
      i === idx ? { ...o, nextId: value } : o,
    );
    const updated = { ...draft, options };
    setDraft(updated);
    onUpdate(updated);
  };

  const handleAddOption = () => {
    if (draft.options.length >= 4) return;
    const options = [...draft.options, { label: "New option", nextId: "" }];
    const updated = { ...draft, options };
    setDraft(updated);
    onUpdate(updated);
  };

  const handleDeleteOption = (idx) => {
    const options = draft.options.filter((_, i) => i !== idx);
    const updated = { ...draft, options };
    setDraft(updated);
    onUpdate(updated);
  };

  const linkableNodes = (allNodes || []).filter((n) => n.id !== draft.id);

  const typeColor = {
    start: "var(--node-start-color)",
    question: "var(--node-question-color)",
    end: "var(--node-end-color)",
  }[draft.type];

  return (
    <aside className="edit-panel">
      {/* ── Header ── */}
      <div className="edit-panel__header">
        <div className="edit-panel__header-left">
          <div
            className="edit-panel__type-dot"
            style={{ background: typeColor, boxShadow: `0 0 8px ${typeColor}` }}
          />
          <div>
            <p className="edit-panel__title">Edit Node</p>
            <p className="edit-panel__subtitle">
              ID: {draft.id} · <NodeIdBadge type={draft.type} />
            </p>
          </div>
        </div>
        <button
          className="edit-panel__close-btn"
          onClick={onClose}
          title="Close panel"
        >
          <IconClose />
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div className="edit-panel__body">
        {/* Question text */}
        <section className="edit-panel__section">
          <label className="edit-panel__label">Question Text</label>
          <textarea
            className="edit-panel__textarea"
            value={draft.text}
            onChange={handleTextChange}
            rows={3}
            placeholder="Enter the message this node displays..."
          />
          <p className="edit-panel__hint">{draft.text.length} characters</p>
        </section>

        {/* Answer options */}
        {draft.type !== "end" && (
          <section className="edit-panel__section">
            <div className="edit-panel__section-header">
              <label className="edit-panel__label">Answer Options</label>
              <span className="edit-panel__count">
                {draft.options.length} / 4
              </span>
            </div>

            <div className="edit-panel__options-list">
              {draft.options.map((opt, idx) => (
                <div key={idx} className="edit-panel__option-row">
                  <div className="edit-panel__option-index">{idx + 1}</div>
                  <div className="edit-panel__option-fields">
                    <input
                      className="edit-panel__input"
                      type="text"
                      value={opt.label}
                      onChange={(e) =>
                        handleOptionLabelChange(idx, e.target.value)
                      }
                      placeholder="Option label..."
                    />
                    <div className="edit-panel__link-row">
                      <IconLink />
                      <select
                        className="edit-panel__select"
                        value={opt.nextId}
                        onChange={(e) =>
                          handleOptionNextChange(idx, e.target.value)
                        }
                      >
                        <option value="">— no link —</option>
                        {linkableNodes.map((n) => (
                          <option key={n.id} value={n.id}>
                            [{n.type}] {n.text.slice(0, 32)}
                            {n.text.length > 32 ? "…" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    className="edit-panel__delete-btn"
                    onClick={() => handleDeleteOption(idx)}
                    title="Delete option"
                  >
                    <IconTrash />
                  </button>
                </div>
              ))}
            </div>

            {draft.options.length < 4 && (
              <button className="edit-panel__add-btn" onClick={handleAddOption}>
                <IconPlus />
                <span>Add Option</span>
              </button>
            )}
          </section>
        )}

        {/* Position */}
        <section className="edit-panel__section">
          <label className="edit-panel__label">Position</label>
          <div className="edit-panel__position-row">
            <div className="edit-panel__position-field">
              <span className="edit-panel__position-axis">X</span>
              <span className="edit-panel__position-value">
                {draft.position.x}
              </span>
            </div>
            <div className="edit-panel__position-field">
              <span className="edit-panel__position-axis">Y</span>
              <span className="edit-panel__position-value">
                {draft.position.y}
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ── Footer ── */}
      <div className="edit-panel__footer">
        <p className="edit-panel__footer-note">
          Changes apply instantly to the canvas
        </p>
      </div>
    </aside>
  );
}
