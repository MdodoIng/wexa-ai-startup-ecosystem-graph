import { useEffect, useState } from "react";
import { Link } from "react-router";
import { LoadingState, EmptyState } from "../components/LoadingState";
import { Search, Filter, Plus, TrendingUp, Users, MapPin } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

function StartupCard({ startup }: { startup: any }) {
  const formatValuation = (v: number) => {
    if (v >= 1000000000) return `$${(v / 1000000000).toFixed(1)}B`;
    if (v >= 1000000) return `$${(v / 1000000).toFixed(0)}M`;
    return `$${(v / 1000).toFixed(0)}K`;
  };

  return (
    <Link to={`/startups/${startup.id}`} className="card startup-card">
      <div className="card-header">
        <div className="logo" style={{ background: `hsl(${startup.id.charCodeAt(1) * 30}, 70%, 45%)` }}>
          {startup.logo}
        </div>
        <div className="card-title-group">
          <h3>{startup.name}</h3>
          <span className="badge badge-stage">{startup.stage}</span>
        </div>
      </div>
      <p className="card-description">{startup.description}</p>
      <div className="card-meta">
        <span className="meta-item"><TrendingUp size={14} />{formatValuation(startup.valuation)}</span>
        <span className="meta-item"><Users size={14} />{startup.employees}</span>
        <span className="meta-item"><MapPin size={14} />{startup.headquarters?.split(",")[0]}</span>
      </div>
      {startup.markets && startup.markets.length > 0 && (
        <div className="tag-group">
          {startup.markets.slice(0, 3).map((m: string) => (
            <span key={m} className="tag">{m}</span>
          ))}
        </div>
      )}
    </Link>
  );
}

export default function Startups() {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");

  useEffect(() => {
    fetchStartups();
  }, [stage]);

  const fetchStartups = (searchTerm = search) => {
    setLoading(true);
    let url = `${API_URL}/api/startups?`;
    if (stage) url += `stage=${encodeURIComponent(stage)}&`;
    if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}`;
    
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setStartups(data.startups || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStartups();
  };

  if (loading) return <LoadingState message="Loading startups..." />;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Startups</h1>
        <Link to="/startups/new" className="btn btn-primary">
          <Plus size={18} /> Add Startup
        </Link>
      </div>
      
      <div className="filters">
        <form onSubmit={handleSearch} className="search-form">
          <input type="text" placeholder="Search startups..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <button type="submit"><Search size={18} /></button>
        </form>
        <div className="filter-group">
          <Filter size={16} />
          <select value={stage} onChange={(e) => setStage(e.target.value)}>
            <option value="">All Stages</option>
            <option value="Seed">Seed</option>
            <option value="Series A">Series A</option>
            <option value="Series B">Series B</option>
            <option value="Series C">Series C</option>
            <option value="Series D">Series D</option>
          </select>
        </div>
      </div>

      {startups.length === 0 ? (
        <EmptyState message="No startups found matching your criteria" />
      ) : (
        <div className="card-grid">
          {startups.map((s: any) => <StartupCard key={s.id} startup={s} />)}
        </div>
      )}
    </div>
  );
}