import { useRef, useEffect, useState, useCallback } from "react";
import Node from "../Node/Node";
import Connector from "../Connector/Connector";
import MiniMap from "../MiniMap/MiniMap";
import "./Canvas.css";

function buildConnections(nodes, contentEl, zoom) {
  if (!contentEl) return [];

  const connections = [];
  const contentRect = contentEl.getBoundingClientRect();

  nodes.forEach((node) => {
    if (!node.options || node.options.length === 0) return;

    node.options.forEach((opt, optIdx) => {
      if (!opt.nextId) return;

      const outDot = contentEl.querySelector(
        `[data-node-id="${node.id}"] [data-connector="out"][data-option-index="${optIdx}"]`,
      );
      const inDot = contentEl.querySelector(
        `[data-node-id="${opt.nextId}"] [data-connector="in"]`,
      );
      if (!outDot || !inDot) return;

      const outRect = outDot.getBoundingClientRect();
      const inRect = inDot.getBoundingClientRect();

      // getBoundingClientRect returns SCALED screen pixels.
      // Dividing by zoom converts them back to content-space pixels
      // so the SVG paths (which live in content-space) line up correctly.
      connections.push({
        from: {
          x: (outRect.left + outRect.width / 2 - contentRect.left) / zoom,
          y: (outRect.top + outRect.height / 2 - contentRect.top) / zoom,
        },
        to: {
          x: (inRect.left + inRect.width / 2 - contentRect.left) / zoom,
          y: (inRect.top + inRect.height / 2 - contentRect.top) / zoom,
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
  isPanelOpen,
}) {
  const canvasRef = useRef(null);
  const contentRef = useRef(null);

  const [connections, setConnections] = useState([]);
  const [viewportSize, setViewportSize] = useState({ w: 0, h: 0 });

  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const [pan, setPan] = useState({ x: 60, y: 40 });

  // track canvas size for minimap
  useEffect(() => {
    if (!canvasRef.current) return;
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setViewportSize({ w: width, h: height });
    });
    obs.observe(canvasRef.current);
    return () => obs.disconnect();
  }, []);

  // recalc passes zoom so coordinates are divided correctly
  const recalc = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const conns = buildConnections(nodes, contentRef.current, zoom);
        setConnections(conns);
      });
    });
  }, [nodes, zoom]);

  useEffect(() => {
    recalc();
  }, [recalc]);
  useEffect(() => {
    recalc();
  }, [pan, zoom, recalc]);

  // pan handlers
  const handleMouseDown = useCallback(
    (e) => {
      const isBackground =
        e.target === canvasRef.current ||
        e.target === contentRef.current ||
        e.target.classList.contains("canvas__grid");
      if (!isBackground) return;
      isPanning.current = true;
      panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      e.preventDefault();
    },
    [pan],
  );

  const handleMouseMove = useCallback((e) => {
    if (!isPanning.current) return;
    setPan({
      x: e.clientX - panStart.current.x,
      y: e.clientY - panStart.current.y,
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const handleCanvasClick = useCallback(
    (e) => {
      const isBackground =
        e.target === canvasRef.current ||
        e.target === contentRef.current ||
        e.target.classList.contains("canvas__grid");
      if (isBackground) onSelectNode(null);
    },
    [onSelectNode],
  );

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

      <MiniMap
        nodes={nodes}
        canvasW={1400}
        canvasH={900}
        pan={pan}
        zoom={zoom}
        viewportW={viewportSize.w}
        viewportH={viewportSize.h}
        isPanelOpen={isPanelOpen}
      />

      <div className="canvas__zoom-badge">{Math.round(zoom * 100)}%</div>

      <div className="canvas__hint">
        Drag canvas to pan · Click node to edit
      </div>
    </div>
  );
}
