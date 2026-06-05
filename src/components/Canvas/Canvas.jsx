import { useRef, useEffect, useState, useCallback } from 'react'
import Node from '../Node/Node'
import Connector from '../Connector/Connector'
import './Canvas.css'

/*
 * For each node's options, find the pixel coordinates of:
 *   - the output dot (right side of each option row)
 *   - the input dot  (top-center of the target node)
 * We read these from the DOM after render using data attributes.
 */
function buildConnections(nodes, canvasEl) {
  if (!canvasEl) return []

  const connections = []
  const canvasRect  = canvasEl.getBoundingClientRect()

  nodes.forEach(node => {
    if (!node.options || node.options.length === 0) return

    node.options.forEach((opt, optIdx) => {
      if (!opt.nextId) return

      // ── source: the output dot on this option row ──
      const outDot = canvasEl.querySelector(
        `[data-node-id="${node.id}"] [data-connector="out"][data-option-index="${optIdx}"]`
      )

      // ── target: the input dot on the target node ──
      const inDot = canvasEl.querySelector(
        `[data-node-id="${opt.nextId}"] [data-connector="in"]`
      )

      if (!outDot || !inDot) return

      const outRect = outDot.getBoundingClientRect()
      const inRect  = inDot.getBoundingClientRect()

      connections.push({
        from: {
          x: outRect.left + outRect.width  / 2 - canvasRect.left,
          y: outRect.top  + outRect.height / 2 - canvasRect.top,
        },
        to: {
          x: inRect.left + inRect.width  / 2 - canvasRect.left,
          y: inRect.top  + inRect.height / 2 - canvasRect.top,
        },
      })
    })
  })

  return connections
}

export default function Canvas({
  nodes,
  selectedNodeId,
  onSelectNode,
  onUpdateNode,
  zoom,
}) {
  const canvasRef     = useRef(null)
  const contentRef    = useRef(null)
  const [connections, setConnections] = useState([])

  // pan state
  const isPanning   = useRef(false)
  const panStart    = useRef({ x: 0, y: 0 })
  const [pan, setPan] = useState({ x: 60, y: 40 })

  // ── Recalculate connector lines after render ──
  const recalc = useCallback(() => {
    // rAF ensures DOM has painted
    requestAnimationFrame(() => {
      const conns = buildConnections(nodes, canvasRef.current)
      setConnections(conns)
    })
  }, [nodes])

  useEffect(() => { recalc() }, [recalc])

  // ── Pan handlers ──
  const handleMouseDown = (e) => {
    // only pan on canvas background (not on nodes)
    if (e.target !== canvasRef.current && e.target !== contentRef.current) return
    isPanning.current = true
    panStart.current  = { x: e.clientX - pan.x, y: e.clientY - pan.y }
    e.preventDefault()
  }

  const handleMouseMove = useCallback((e) => {
    if (!isPanning.current) return
    setPan({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y })
  }, [])

  const handleMouseUp = useCallback(() => {
    if (isPanning.current) {
      isPanning.current = false
      recalc()
    }
  }, [recalc])

  // deselect on canvas click
  const handleCanvasClick = () => onSelectNode(null)

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
      {/* dot-grid background — fixed, not affected by zoom/pan */}
      <div className="canvas__grid" />

      {/* zoomable / pannable content layer */}
      <div
        ref={contentRef}
        className="canvas__content"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {/* SVG connector lines sit inside the content layer */}
        <Connector connections={connections} />

        {/* Node cards */}
        {nodes.map(node => (
          <Node
            key={node.id}
            node={node}
            isSelected={selectedNodeId === node.id}
            onSelect={onSelectNode}
            onUpdateNode={onUpdateNode}
          />
        ))}
      </div>

      {/* zoom level badge */}
      <div className="canvas__zoom-badge">
        {Math.round(zoom * 100)}%
      </div>

      {/* hint */}
      <div className="canvas__hint">
        Drag canvas to pan · Click node to edit
      </div>
    </div>
  )
}