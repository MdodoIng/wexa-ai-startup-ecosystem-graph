import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Rocket, Users, UserCircle, TrendingUp, Activity } from "lucide-react";
import { LoadingState } from "../components/LoadingState";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function Home() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/network/stats`)
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const formatMoney = (v: number) => {
    if (!v) return "$0";
    if (v >= 1000000000) return `$${(v / 1000000000).toFixed(1)}B`;
    return `$${(v / 1000000).toFixed(0)}M`;
  };

  if (loading) return <LoadingState message="Loading ecosystem data..." />;

  return (
    <div className="home-page">
      <section className="hero">
        <h1>Startup Ecosystem & Investment Network</h1>
        <p>Explore the connections between startups, investors, and founders in our graph-powered database</p>
        <div className="hero-stats">
          <div className="stat-card"><Rocket size={24} /><span className="stat-value">{stats?.startups || 0}</span><span className="stat-label">Startups</span></div>
          <div className="stat-card"><Users size={24} /><span className="stat-value">{stats?.investors || 0}</span><span className="stat-label">Investors</span></div>
          <div className="stat-card"><UserCircle size={24} /><span className="stat-value">{stats?.founders || 0}</span><span className="stat-label">Founders</span></div>
          <div className="stat-card"><TrendingUp size={24} /><span className="stat-value">{formatMoney(stats?.totalFunding)}</span><span className="stat-label">Total Funding</span></div>
        </div>
      </section>
      <section className="quick-links">
        <h2>Explore the Network</h2>
        <div className="link-grid">
          <Link to="/startups" className="quick-link"><Rocket size={32} /><h3>Browse Startups</h3><p>Discover companies by stage, market, and valuation</p></Link>
          <Link to="/investors" className="quick-link"><Users size={32} /><h3>Explore Investors</h3><p>View portfolios and co-investor networks</p></Link>
          <Link to="/network" className="quick-link"><Activity size={32} /><h3>Visualize Network</h3><p>See the graph of connections in the ecosystem</p></Link>
          <Link to="/queries" className="quick-link"><TrendingUp size={32} /><h3>Run Queries</h3><p>Execute powerful multi-hop graph traversals</p></Link>
        </div>
      </section>
    </div>
  );
}