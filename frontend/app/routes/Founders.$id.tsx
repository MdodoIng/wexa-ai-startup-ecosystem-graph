import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { LoadingState } from "../components/LoadingState";
import { ArrowLeft, UserCircle, Pencil, Trash2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function FounderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [founder, setFounder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/founders/${id}`).then(r => r.json()).then(data => {
      setFounder(data);
      setLoading(false);
    });
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Delete this founder?")) return;
    const res = await fetch(`${API_URL}/api/founders/${id}`, { method: "DELETE" });
    if (res.ok) navigate("/founders");
    else alert("Failed to delete");
  };

  if (loading) return <LoadingState message="Loading founder details..." />;
  if (!founder) return <div>Not found</div>;

  return (
    <div className="page detail-page">
      <Link to="/founders" className="back-link"><ArrowLeft size={18} /> Back to Founders</Link>
      <div className="detail-header">
        <UserCircle size={64} className="founder-icon large" />
        <div className="detail-title">
          <h1>{founder.name}</h1>
          <span className="badge badge-role">{founder.role}</span>
        </div>
        <div className="detail-actions">
          <Link to={`/founders/${id}/edit`} className="btn btn-secondary"><Pencil size={16} /> Edit</Link>
          <button onClick={handleDelete} className="btn btn-danger"><Trash2 size={16} /> Delete</button>
        </div>
      </div>
      <p className="detail-description">{founder.background}</p>
      {founder.founded?.length > 0 && (
        <section className="detail-section">
          <h2>Founded Companies</h2>
          <div className="card-grid small">
            {founder.founded.map((s: any) => (
              <Link key={s.id} to={`/startups/${s.id}`} className="card mini-card">
                <div className="logo small" style={{ background: `hsl(${s.id.charCodeAt(1) * 30}, 70%, 45%)` }}>{s.logo}</div>
                <div><h4>{s.name}</h4><span className="badge badge-stage">{s.stage}</span></div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}