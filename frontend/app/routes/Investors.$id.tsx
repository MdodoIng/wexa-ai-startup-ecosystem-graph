import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { LoadingState } from "../components/LoadingState";
import { ArrowLeft, Wallet, Pencil, Trash2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function InvestorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [investor, setInvestor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/investors/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setInvestor(data);
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Delete this investor?")) return;
    const res = await fetch(`${API_URL}/api/investors/${id}`, {
      method: "DELETE",
    });
    if (res.ok) navigate("/investors");
    else alert("Failed to delete");
  };

  const formatMoney = (v: number) => {
    if (!v) return "$0";
    if (v >= 1000000000) return `$${(v / 1000000000).toFixed(0)}B`;
    return `$${(v / 1000000).toFixed(0)}M`;
  };

  if (loading) return <LoadingState message="Loading investor details..." />;
  if (!investor) return <div>Not found</div>;

  return (
    <div className="page detail-page">
      <Link to="/investors" className="back-link">
        <ArrowLeft size={18} /> Back to Investors
      </Link>
      <div className="detail-header">
        <div
          className="logo large"
          style={{
            background: `hsl(${id!.charCodeAt(1) * 40 + 180}, 70%, 40%)`,
          }}
        >
          {investor.logo}
        </div>
        <div className="detail-title">
          <h1>{investor.name}</h1>
          <span className="badge badge-type">{investor.type}</span>
        </div>
        <div className="detail-actions">
          <Link to={`/investors/${id}/edit`} className="btn btn-secondary">
            <Pencil size={16} /> Edit
          </Link>
          <button onClick={handleDelete} className="btn btn-danger">
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>
      <div className="detail-meta-grid">
        <div className="meta-card">
          <Wallet size={20} />
          <span className="meta-label">AUM</span>
          <span className="meta-value">{formatMoney(investor.aum)}</span>
        </div>
        <div className="meta-card">
          <span className="meta-label">Founded</span>
          <span className="meta-value">{investor.founded}</span>
        </div>
        <div className="meta-card">
          <span className="meta-label">Focus</span>
          <span className="meta-value">{investor.focus}</span>
        </div>
      </div>
      <section className="detail-section">
        <h2>Portfolio Companies</h2>
        <div className="card-grid small">
          {investor.portfolio?.map((s: any) => (
            <Link
              key={s.id}
              to={`/startups/${s.id}`}
              className="card mini-card"
            >
              <div
                className="logo small"
                style={{
                  background: `hsl(${s.id.charCodeAt(1) * 30}, 70%, 45%)`,
                }}
              >
                {s.logo}
              </div>
              <div>
                <h4>{s.name}</h4>
                <span className="badge badge-stage">{s.stage}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
