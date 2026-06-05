import "./Connector.css";

/*
 * Draws a smooth cubic bezier SVG path between two points.
 * p1 = { x, y } source (output dot center)
 * p2 = { x, y } target (input dot center)
 */
function bezierPath(p1, p2) {
  const dy = p2.y - p1.y;
  const cy = Math.max(Math.abs(dy) * 0.5, 60);
  return `M ${p1.x} ${p1.y} C ${p1.x} ${p1.y + cy}, ${p2.x} ${p2.y - cy}, ${p2.x} ${p2.y}`;
}

export default function Connector({ connections }) {
  if (!connections || connections.length === 0) return null;

  return (
    <svg className="connector-layer" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L8,3 z" fill="var(--connector-color)" />
        </marker>
        <marker
          id="arrowhead-hover"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L8,3 z" fill="var(--connector-hover)" />
        </marker>
      </defs>

      {connections.map((conn, idx) => {
        const d = bezierPath(conn.from, conn.to);
        return (
          <g key={idx} className="connector__group">
            {/* wide invisible hit area */}
            <path d={d} className="connector__hit" fill="none" />
            {/* visible line */}
            <path
              d={d}
              className="connector__line"
              fill="none"
              markerEnd="url(#arrowhead)"
            />
          </g>
        );
      })}
    </svg>
  );
}
