import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { LoadingState } from "../components/LoadingState";
import { ArrowLeft, TrendingUp, Users, MapPin, Calendar, Globe, Pencil, Trash2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function StartupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [startup, setStartup] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/startups/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setStartup(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this startup?")) return;
    const res = await fetch(`${API_URL}/api/startups/${id}`, { method: "DELETE" });
    if (res.ok) {
      navigate("/startups");
    } else {
      alert("Failed to delete");
    }
  };

  const formatMoney = (v: number) => {
    if (!v) return "$0";
    if (v >= 1000000000) return `$${(v / 1000000000).toFixed(1)}B`;
    if (v >= 1000000) return `$${(v / 1000000).toFixed(0)}M`;
    return `$${(v / 1000).toFixed(0)}K`;
  };

  if (loading) return <LoadingState message="Loading startup details..." />;
  if (!startup) return <div className="empty-state">Startup not found</div>;

  return (
    <div className="page detail-page">
      <Link to="/startups" className="back-link"><ArrowLeft size={18} /> Back to Startups</Link>
      
      <div className="detail-header">
        <div className="logo large" style={{ background: `hsl(${id!.charCodeAt(1) * 30}, 70%, 45%)` }}>
          {startup.logo}
        </div>
        <div className="detail-title">
          <h1>{startup.name}</h1>
          <span className="badge badge-stage">{startup.stage}</span>
        </div>
        <div className="detail-actions">
          <Link to={`/startups/${id}/edit`} className="btn btn-secondary">
            <Pencil size={16} /> Edit
          </Link>
          <button onClick={handleDelete} className="btn btn-danger">
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      <p className="detail-description">{startup.description}</p>

      <div className="detail-meta-grid">
        <div className="meta-card"><TrendingUp size={20} /><span className="meta-label">Valuation</span><span className="meta-value">{formatMoney(startup.valuation)}</span></div>
        <div className="meta-card"><Users size={20} /><span className="meta-label">Employees</span><span className="meta-value">{startup.employees}</span></div>
        <div className="meta-card"><MapPin size={20} /><span className="meta-label">Location</span><span className="meta-value">{startup.headquarters}</span></div>
        <div className="meta-card"><Calendar size={20} /><span className="meta-label">Founded</span><span className="meta-value">{startup.founded}</span></div>
      </div>

      {startup.markets?.length > 0 && (
        <section className="detail-section">
          <h2>Markets</h2>
          <div className="tag-group">
            {startup.markets.map((m: string) => <span key={m} className="tag tag-large">{m}</span>)}
          </div>
        </section>
      )}

      {startup.founders?.length > 0 && (
        <section className="detail-section">
          <h2>Founders</h2>
          <div className="person-grid">
            {startup.founders.map((f: any) => (
              <div key={f.name} className="person-card">
                <h4>{f.name}</h4>
                <span className="person-role">{f.role}</span>
                <p className="person-background">{f.background}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {startup.fundingRounds?.length > 0 && (
        <section className="detail-section">
          <h2>Funding History</h2>
          <div className="timeline">
            {[...startup.fundingRounds].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((r: any) => (
              <div key={r.id} className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <h4>{r.type}</h4>
                  <p>{formatMoney(r.amount)} at {formatMoney(r.valuation)} valuation</p>
                  <span className="timeline-date">{r.date}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}