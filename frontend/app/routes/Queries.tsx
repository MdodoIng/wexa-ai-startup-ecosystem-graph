import { useState } from "react";
import { Search, ChevronDown, ChevronUp, Code } from "lucide-react";
import { LoadingState } from "../components/LoadingState";

const API_URL = import.meta.env.VITE_API_URL || "";

const queryEndpoints = [
  { key: "investor-market-exposure", title: "AI Market Investor Exposure", desc: "Which investors have portfolio companies in AI?" },
  { key: "founder-advisor-conflicts", title: "Founder-Advisor Conflicts", desc: "Founders advising competing companies" },
  { key: "warm-introductions", title: "Warm Introduction Paths", desc: "Shortest paths between investors and startups" },
  { key: "portfolio-diversification", title: "Portfolio Diversification", desc: "Investors across multiple markets" },
  { key: "founder-ecosystem", title: "Founder Ecosystem", desc: "Founders connected through shared companies" },
  { key: "competitive-investor-overlap", title: "Competitive Investor Overlap", desc: "Competitors sharing investors" },
  { key: "adjacent-markets", title: "Adjacent Market Opportunities", desc: "Markets adjacent to current investments" },
];

function QueryCard({ endpoint }: { endpoint: any }) {
  const [expanded, setExpanded] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runQuery = () => {
    if (result) { setExpanded(!expanded); return; }
    setLoading(true);
    fetch(`${API_URL}/api/queries/${endpoint.key}`)
      .then(r => r.json())
      .then(data => { setResult(data); setExpanded(true); setLoading(false); });
  };

  return (
    <div className="query-card">
      <button className="query-header" onClick={runQuery}>
        <div><h3>{endpoint.title}</h3><p>{endpoint.desc}</p></div>
        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {loading && <LoadingState message="Running query..." />}
      {expanded && result && (
        <div className="query-result">
          <div className="cypher-block"><Code size={16} /><pre>{result.cypher}</pre></div>
          <p className="query-description">{result.description}</p>
          <div className="result-table">
            <table>
              <thead><tr>{Object.keys(result.result[0] || {}).map(k => <th key={k}>{k}</th>)}</tr></thead>
              <tbody>
                {result.result.map((row: any, i: number) => (
                  <tr key={i}>{Object.values(row).map((v: any, j: number) => (
                    <td key={j}>{Array.isArray(v) ? v.join(", ") : typeof v === "object" ? JSON.stringify(v) : String(v)}</td>
                  ))}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Queries() {
  return (
    <div className="page queries-page">
      <h1><Search size={24} /> Graph Query Explorer</h1>
      <p className="page-subtitle">Explore powerful multi-hop traversals that showcase why graph databases excel at relationship queries.</p>
      <div className="query-list">{queryEndpoints.map(ep => <QueryCard key={ep.key} endpoint={ep} />)}</div>
    </div>
  );
}