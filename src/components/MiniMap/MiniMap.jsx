import { useEffect, useRef, useState } from "react";
import "./MiniMap.css";

const MAP_W = 180;
const MAP_H = 110;

// node type colors matching design tokens
const TYPE_COLOR = {
  start: "#8b5cf6",
  question: "#4d8ef8",
  end: "#22c55e",
};

export default function MiniMap({
  nodes,
  canvasW = 1400,
  canvasH = 900,
  pan,
  zoom,
  viewportW,
  viewportH,
}) {
  const canvasRef = useRef(null);
  const [expanded, setExpanded] = useState(true);

  // scale from canvas-space → minimap-space
  const scaleX = MAP_W / canvasW;
  const scaleY = MAP_H / canvasH;

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");

    // ── clear ──
    ctx.clearRect(0, 0, MAP_W, MAP_H);

    // ── draw connection lines first (behind nodes) ──
    ctx.strokeStyle = "rgba(148,163,184,0.2)";
    ctx.lineWidth = 0.8;

    nodes.forEach((node) => {
      if (!node.options) return;
      node.options.forEach((opt) => {
        const target = nodes.find((n) => n.id === opt.nextId);
        if (!target) return;

        const x1 = node.position.x * scaleX;
        const y1 = node.position.y * scaleY;
        const x2 = target.position.x * scaleX;
        const y2 = target.position.y * scaleY;

        ctx.beginPath();
        ctx.moveTo(x1, y1);

        // simple bezier matching the main canvas
        const cy = Math.max(Math.abs(y2 - y1) * 0.5, 20) * scaleY;
        ctx.bezierCurveTo(x1, y1 + cy, x2, y2 - cy, x2, y2);
        ctx.stroke();
      });
    });

    // ── draw node dots ──
    nodes.forEach((node) => {
      const x = node.position.x * scaleX;
      const y = node.position.y * scaleY;
      const r = node.type === "start" ? 5 : node.type === "end" ? 3.5 : 4.5;

      // glow
      ctx.shadowColor = TYPE_COLOR[node.type];
      ctx.shadowBlur = 6;

      // fill
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = TYPE_COLOR[node.type];
      ctx.fill();

      // border ring
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 0.8;
      ctx.stroke();
    });

    // reset shadow
    ctx.shadowBlur = 0;

    // ── draw viewport rect ──
    // viewport in canvas-space: pan is translation, zoom scales
    const vpX = -pan.x / zoom;
    const vpY = -pan.y / zoom;
    const vpW = viewportW / zoom;
    const vpH = viewportH / zoom;

    const rx = vpX * scaleX;
    const ry = vpY * scaleY;
    const rw = vpW * scaleX;
    const rh = vpH * scaleY;

    // filled tint
    ctx.fillStyle = "rgba(77, 142, 248, 0.07)";
    ctx.fillRect(rx, ry, rw, rh);

    // border
    ctx.strokeStyle = "rgba(77, 142, 248, 0.55)";
    ctx.lineWidth = 1;
    ctx.strokeRect(rx, ry, rw, rh);

    // corner accents
    const cs = 5; // corner size
    ctx.strokeStyle = "#4d8ef8";
    ctx.lineWidth = 1.5;

    // top-left
    ctx.beginPath();
    ctx.moveTo(rx, ry + cs);
    ctx.lineTo(rx, ry);
    ctx.lineTo(rx + cs, ry);
    ctx.stroke();

    // top-right
    ctx.beginPath();
    ctx.moveTo(rx + rw - cs, ry);
    ctx.lineTo(rx + rw, ry);
    ctx.lineTo(rx + rw, ry + cs);
    ctx.stroke();

    // bottom-left
    ctx.beginPath();
    ctx.moveTo(rx, ry + rh - cs);
    ctx.lineTo(rx, ry + rh);
    ctx.lineTo(rx + cs, ry + rh);
    ctx.stroke();

    // bottom-right
    ctx.beginPath();
    ctx.moveTo(rx + rw - cs, ry + rh);
    ctx.lineTo(rx + rw, ry + rh);
    ctx.lineTo(rx + rw, ry + rh - cs);
    ctx.stroke();
  }, [nodes, pan, zoom, viewportW, viewportH, scaleX, scaleY]);

  return (
    <div
      className={`minimap ${expanded ? "minimap--expanded" : "minimap--collapsed"}`}
    >
      {/* ── Header bar ── */}
      <div className="minimap__header" onClick={() => setExpanded((p) => !p)}>
        <div className="minimap__header-left">
          <div className="minimap__indicator" />
          <span className="minimap__title">Mini Map</span>
        </div>
        <div className="minimap__header-right">
          <span className="minimap__node-count">{nodes.length} nodes</span>
          <svg
            className={`minimap__chevron ${expanded ? "" : "minimap__chevron--flipped"}`}
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <polyline points="18,15 12,9 6,15" />
          </svg>
        </div>
      </div>

      {/* ── Canvas map ── */}
      {expanded && (
        <div className="minimap__body">
          <canvas
            ref={canvasRef}
            width={MAP_W}
            height={MAP_H}
            className="minimap__canvas"
          />

          {/* ── Legend ── */}
          <div className="minimap__legend">
            {Object.entries(TYPE_COLOR).map(([type, color]) => (
              <div key={type} className="minimap__legend-item">
                <span
                  className="minimap__legend-dot"
                  style={{ background: color, boxShadow: `0 0 4px ${color}` }}
                />
                <span className="minimap__legend-label">{type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
