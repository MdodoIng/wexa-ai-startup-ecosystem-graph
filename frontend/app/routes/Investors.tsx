import { useEffect, useState } from "react";
import { Link } from "react-router";
import { LoadingState, EmptyState } from "../components/LoadingState";
import { Search, Plus, Wallet, Building2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

function InvestorCard({ investor }: { investor: any }) {
  const formatAUM = (v: number) => {
    if (v >= 1000000000) return `$${(v / 1000000000).toFixed(0)}B`;
    if (v >= 1000000) return `$${(v / 1000000).toFixed(0)}M`;
    return `$${v}`;
  };

  return (
    <Link to={`/investors/${investor.id}`} className="card investor-card">
      <div className="card-header">
        <div className="logo" style={{ background: `hsl(${investor.id.charCodeAt(1) * 40 + 180}, 70%, 40%)` }}>
          {investor.logo}
        </div>
        <div className="card-title-group">
          <h3>{investor.name}</h3>
          <span className="badge badge-type">{investor.type}</span>
        </div>
      </div>
      <div className="card-meta">
        <span className="meta-item"><Wallet size={14} />AUM: {formatAUM(investor.aum)}</span>
        <span className="meta-item"><Building2 size={14} />{investor.portfolioSize} companies</span>
      </div>
      <p className="focus-text">Focus: {investor.focus}</p>
    </Link>
  );
}

export default function Investors() {
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchInvestors(); }, []);

  const fetchInvestors = () => {
    setLoading(true);
    let url = `${API_URL}/api/investors`;
    if (search) url += `?search=${encodeURIComponent(search)}`;
    fetch(url).then(r => r.json()).then(data => {
      setInvestors(data.investors || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  if (loading) return <LoadingState message="Loading investors..." />;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Investors</h1>
        <Link to="/investors/new" className="btn btn-primary"><Plus size={18} /> Add Investor</Link>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); fetchInvestors(); }} className="search-form">
        <input type="text" placeholder="Search investors..." value={search} onChange={e => setSearch(e.target.value)} />
        <button type="submit"><Search size={18} /></button>
      </form>
      {investors.length === 0 ? <EmptyState message="No investors found" /> : (
        <div className="card-grid">{investors.map((i: any) => <InvestorCard key={i.id} investor={i} />)}</div>
      )}
    </div>
  );
}