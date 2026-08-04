import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import SpriteText from "three-spritetext";
import { LoadingState } from "../components/LoadingState";
import { Network as NetworkIcon, Filter } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

const COLOR_MAP: Record<string, string> = {
  Startup: "#3b82f6",
  Investor: "#10b981",
  Founder: "#f59e0b",
  FundingRound: "#8b5cf6",
  Market: "#ef4444",
};

const NODE_SIZE: Record<string, number> = {
  Startup: 8,
  Investor: 7,
  Founder: 4,
  FundingRound: 5,
  Market: 5,
};

const DIM_COLOR = "#d1d5db";
const HIGHLIGHT_LINK_COLOR = "#f97316";
const DIM_LINK_COLOR = "rgba(203, 213, 225, 0.25)";

export default function Network() {
  const [ForceGraph3D, setForceGraph3D] = useState<any>(null);
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<any>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [dims, setDims] = useState({ width: 900, height: 600 });

  // NEW: track which nodes/links are "connected" to the current selection
  const [highlightNodes, setHighlightNodes] = useState<Set<number>>(new Set());
  const [highlightLinks, setHighlightLinks] = useState<Set<any>>(new Set());

  useEffect(() => {
    import("react-force-graph-3d").then((mod) => setForceGraph3D(() => mod.default));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/network/graph?type=${filter}`)
      .then((r) => r.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  }, [filter]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setDims({ width, height: 600 });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!fgRef.current) return;
    const controls = fgRef.current.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;
    const stop = () => (controls.autoRotate = false);
    controls.addEventListener("start", stop);
    return () => controls.removeEventListener("start", stop);
  }, [data]);

  // NEW: precompute neighbor map once per dataset so click handling is O(1)-ish
  const neighborMap = useMemo(() => {
    const map = new Map<number, { nodes: Set<number>; links: Set<any> }>();
    data.nodes.forEach((n: any) => map.set(n.id, { nodes: new Set(), links: new Set() }));
    data.links.forEach((link: any) => {
      const sourceId = typeof link.source === "object" ? link.source.id : link.source;
      const targetId = typeof link.target === "object" ? link.target.id : link.target;
      map.get(sourceId)?.nodes.add(targetId);
      map.get(sourceId)?.links.add(link);
      map.get(targetId)?.nodes.add(sourceId);
      map.get(targetId)?.links.add(link);
    });
    return map;
  }, [data]);

  const clearHighlight = useCallback(() => {
    setHighlightNodes(new Set());
    setHighlightLinks(new Set());
    setSelectedNode(null);
  }, []);

  const applyHighlight = useCallback(
    (node: any) => {
      const neighbors = neighborMap.get(node.id);
      const nodeSet = new Set<number>([node.id, ...(neighbors?.nodes ?? [])]);
      const linkSet = new Set<any>(neighbors?.links ?? []);
      setHighlightNodes(nodeSet);
      setHighlightLinks(linkSet);
    },
    [neighborMap]
  );

  const nodeThreeObject = useCallback((node: any) => {
    const sprite = new SpriteText(node.name || node.logo || node.label);
    sprite.color = "#334155";
    sprite.textHeight = 3.2;
    sprite.position.set(0, (NODE_SIZE[node.label] || 5) + 3, 0);
    return sprite;
  }, []);

  if (loading) return <LoadingState message="Loading network visualization..." />;

  const hasHighlight = highlightNodes.size > 0;

  return (
    <div className="page network-page">
      <h1>
        <NetworkIcon size={24} /> Ecosystem Network
      </h1>

      <div className="filter-bar">
        <Filter size={16} />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Connections</option>
          <option value="investment">Investment Network</option>
          <option value="founder">Founder Network</option>
        </select>
        {hasHighlight && (
          <button className="clear-highlight-btn" onClick={clearHighlight}>
            Clear selection
          </button>
        )}
      </div>

      <div className="legend">
        {Object.entries(COLOR_MAP).map(([label, color]) => (
          <span key={label}>
            <span className="dot" style={{ background: color }} /> {label}
          </span>
        ))}
      </div>

      <div ref={containerRef} className="network-svg" style={{ width: "100%", height: 600 }}>
        <ForceGraph3D
          ref={fgRef}
          width={dims.width}
          height={dims.height}
          graphData={data}
          nodeLabel={(n: any) => n.name || n.label}
          nodeColor={(n: any) => {
            if (!hasHighlight) return COLOR_MAP[n.label] || "#64748b";
            return highlightNodes.has(n.id) ? COLOR_MAP[n.label] || "#64748b" : DIM_COLOR;
          }}
          nodeOpacity={hasHighlight ? 0.95 : 0.9}
          nodeVal={(n: any) => NODE_SIZE[n.label] || 5}
          nodeThreeObjectExtend={true}
          nodeThreeObject={nodeThreeObject}
          linkColor={(l: any) =>
            hasHighlight
              ? highlightLinks.has(l)
                ? HIGHLIGHT_LINK_COLOR
                : DIM_LINK_COLOR
              : "rgba(148, 163, 184, 0.55)"
          }
          linkWidth={(l: any) => (highlightLinks.has(l) ? 2.5 : 1)}
          linkDirectionalParticles={(l: any) => (highlightLinks.has(l) ? 3 : 1)}
          linkDirectionalParticleWidth={1.4}
          linkDirectionalParticleSpeed={0.004}
          backgroundColor="#ffffff"
          onNodeClick={(node: any) => {
            setSelectedNode(node);
            applyHighlight(node);

            const distance = 120;
            const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
            fgRef.current.cameraPosition(
              { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
              node,
              800
            );
          }}
          onBackgroundClick={clearHighlight}
        />
      </div>

      {selectedNode && (
        <div className="detail-card">
          <h3>{selectedNode.name || selectedNode.label}</h3>
          <p>Type: {selectedNode.label}</p>
          {selectedNode.stage && <p>Stage: {selectedNode.stage}</p>}
          {selectedNode.focus && <p>Focus: {selectedNode.focus}</p>}
          <p className="connected-count">
            {highlightNodes.size - 1} connected node{highlightNodes.size - 1 === 1 ? "" : "s"}
          </p>
        </div>
      )}
    </div>
  );
}