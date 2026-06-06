import { useRef, useEffect, useState, useCallback } from "react";
import Node from "../Node/Node";
import Connector from "../Connector/Connector";
import MiniMap from "../MiniMap/MiniMap";
import "./Canvas.css";

function buildConnections(nodes, canvasEl) {
  if (!canvasEl) return [];
  const connections = [];
  const canvasRect = canvasEl.getBoundingClientRect();

  nodes.forEach((node) => {
    if (!node.options || node.options.length === 0) return;
    node.options.forEach((opt, optIdx) => {
      if (!opt.nextId) return;

      const outDot = canvasEl.querySelector(
        `[data-node-id="${node.id}"] [data-connector="out"][data-option-index="${optIdx}"]`,
      );
      const inDot = canvasEl.querySelector(
        `[data-node-id="${opt.nextId}"] [data-connector="in"]`,
      );
      if (!outDot || !inDot) return;

      const outRect = outDot.getBoundingClientRect();
      const inRect = inDot.getBoundingClientRect();

      connections.push({
        from: {
          x: outRect.left + outRect.width / 2 - canvasRect.left,
          y: outRect.top + outRect.height / 2 - canvasRect.top,
        },
        to: {
          x: inRect.left + inRect.width / 2 - canvasRect.left,
          y: inRect.top + inRect.height / 2 - canvasRect.top,
        },
      });
    });
  });
  return connections;
}

export default function Canvas({
  nodes,
  selectedNodeId,
  onSelectNode,
  onUpdateNode,
  zoom,
}) {
  const canvasRef = useRef(null);
  const contentRef = useRef(null);
  const [connections, setConnections] = useState([]);
  const [viewportSize, setViewportSize] = useState({ w: 0, h: 0 });

  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const [pan, setPan] = useState({ x: 60, y: 40 });

  // ── track canvas viewport size for minimap ──
  useEffect(() => {
    if (!canvasRef.current) return;
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setViewportSize({ w: width, h: height });
    });
    obs.observe(canvasRef.current);
    return () => obs.disconnect();
  }, []);

  const recalc = useCallback(() => {
    requestAnimationFrame(() => {
      const conns = buildConnections(nodes, canvasRef.current);
      setConnections(conns);
    });
  }, [nodes]);

  useEffect(() => {
    recalc();
  }, [recalc]);

  const handleMouseDown = (e) => {
    if (e.target !== canvasRef.current && e.target !== contentRef.current)
      return;
    isPanning.current = true;
    panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e) => {
    if (!isPanning.current) return;
    setPan({
      x: e.clientX - panStart.current.x,
      y: e.clientY - panStart.current.y,
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    if (isPanning.current) {
      isPanning.current = false;
      recalc();
    }
  }, [recalc]);

  const handleCanvasClick = () => onSelectNode(null);

  return (
    <div
      ref={canvasRef}
      className="canvas"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
    >
      <div className="canvas__grid" />

      <div
        ref={contentRef}
        className="canvas__content"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        <Connector connections={connections} />
        {nodes.map((node) => (
          <Node
            key={node.id}
            node={node}
            isSelected={selectedNodeId === node.id}
            onSelect={onSelectNode}
            onUpdateNode={onUpdateNode}
          />
        ))}
      </div>

      {/* ── Mini Map ── */}
      <MiniMap
        nodes={nodes}
        canvasW={1400}
        canvasH={900}
        pan={pan}
        zoom={zoom}
        viewportW={viewportSize.w}
        viewportH={viewportSize.h}
      />

      <div className="canvas__zoom-badge">{Math.round(zoom * 100)}%</div>

      <div className="canvas__hint">
        Drag canvas to pan · Click node to edit
      </div>
    </div>
  );
}
