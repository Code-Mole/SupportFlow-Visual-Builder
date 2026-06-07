import "./Toolbar.css";

const IconEdit = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconPlay = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5,3 19,12 5,21" />
  </svg>
);

const IconZoomIn = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

const IconZoomOut = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

const IconReset = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

const IconExport = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7,10 12,15 17,10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const IconLogo = () => (
  <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="8" fill="var(--accent-blue)" />
    <circle cx="8" cy="16" r="3" fill="white" />
    <circle cx="24" cy="8" r="3" fill="white" />
    <circle cx="24" cy="24" r="3" fill="white" />
    <line x1="11" y1="15" x2="21" y2="9" stroke="white" strokeWidth="1.5" />
    <line x1="11" y1="17" x2="21" y2="23" stroke="white" strokeWidth="1.5" />
  </svg>
);

export default function Toolbar({
  mode,
  onModeChange,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  nodes,
}) {
  const handleExport = () => {
    const data = JSON.stringify({ nodes }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flow_data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const zoomPercent = Math.round(zoom * 100);

  return (
    <header className="toolbar">
      {/* ── Left: Logo + Brand ── */}
      <div className="toolbar__brand">
        <IconLogo />
        <span className="toolbar__brand-name">SupportFlow</span>
        <span className="toolbar__brand-sub">Builder</span>
      </div>

      {/* ── Center: Mode Toggle ── */}
      <div className="toolbar__center">
        <div className="toolbar__toggle">
          <button
            className={`toolbar__toggle-btn ${mode === "editor" ? "toolbar__toggle-btn--active" : ""}`}
            onClick={() => onModeChange("editor")}
          >
            <IconEdit />
            <span>Editor</span>
          </button>
          <button
            className={`toolbar__toggle-btn ${mode === "preview" ? "toolbar__toggle-btn--active" : ""}`}
            onClick={() => onModeChange("preview")}
          >
            <IconPlay />
            <span>Preview</span>
          </button>
          {/* sliding pill indicator */}
          <div
            className={`toolbar__toggle-indicator ${mode === "preview" ? "toolbar__toggle-indicator--right" : ""}`}
          />
        </div>
      </div>

      {/* ── Right: Zoom + Export ── */}
      <div className="toolbar__actions">
        {/* Zoom controls — only in editor mode */}
        {mode === "editor" && (
          <div className="toolbar__zoom">
            <button
              className="toolbar__icon-btn"
              onClick={onZoomOut}
              title="Zoom out"
              disabled={zoom <= 0.4}
            >
              <IconZoomOut />
            </button>

            <button
              className="toolbar__zoom-label"
              onClick={onResetZoom}
              title="Reset zoom"
            >
              {zoomPercent}%
            </button>

            <button
              className="toolbar__icon-btn"
              onClick={onZoomIn}
              title="Zoom in"
              disabled={zoom >= 2}
            >
              <IconZoomIn />
            </button>

            <button
              className="toolbar__icon-btn"
              onClick={onResetZoom}
              title="Reset view"
            >
              <IconReset />
            </button>

            <div className="toolbar__divider" />
          </div>
        )}

        <button className="toolbar__export-btn" onClick={handleExport}>
          <IconExport />
          <span>Export JSON</span>
        </button>
      </div>
    </header>
  );
}
