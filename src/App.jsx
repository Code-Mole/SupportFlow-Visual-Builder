import { useState, useCallback } from "react";
import flowDataRaw from "./data/flow_data.json";
import Toolbar from "./components/Toolbar/Toolbar";
import Canvas from "./components/Canvas/Canvas";
import EditPanel from "./components/EditPanel/EditPanel";
import Preview from "./components/Preview/Preview";
import "./App.css";

function buildInitialNodes(raw) {
  return raw.nodes.map((n) => ({ ...n }));
}

export default function App() {
  const [nodes, setNodes] = useState(() => buildInitialNodes(flowDataRaw));
  const [mode, setMode] = useState("editor");
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [zoom, setZoom] = useState(1);

  const handleUpdateNode = useCallback((updatedNode) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === updatedNode.id ? updatedNode : n)),
    );
  }, []);

  const handleSelectNode = useCallback((id) => {
    setSelectedNodeId(id ?? null);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const handleZoomIn = useCallback(
    () => setZoom((z) => Math.min(z + 0.1, 2)),
    [],
  );
  const handleZoomOut = useCallback(
    () => setZoom((z) => Math.max(z - 0.1, 0.4)),
    [],
  );
  const handleResetZoom = useCallback(() => setZoom(1), []);

  const handleModeChange = useCallback((newMode) => {
    setMode(newMode);
    setSelectedNodeId(null);
  }, []);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

  return (
    <div className="app-shell">
      <Toolbar
        mode={mode}
        onModeChange={handleModeChange}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        nodes={nodes}
      />
      <div className="app-body">
        {mode === "editor" ? (
          <>
            <Canvas
              nodes={nodes}
              selectedNodeId={selectedNodeId}
              onSelectNode={handleSelectNode}
              onUpdateNode={handleUpdateNode}
              zoom={zoom}
            />
            <EditPanel
              node={selectedNode}
              onClose={handleClosePanel}
              onUpdate={handleUpdateNode}
              allNodes={nodes}
            />
          </>
        ) : (
          <Preview nodes={nodes} onExit={() => handleModeChange("editor")} />
        )}
      </div>
    </div>
  );
}
