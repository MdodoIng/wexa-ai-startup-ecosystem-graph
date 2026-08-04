import { useEffect, useState } from "react";
import { Link } from "react-router";
import { LoadingState, EmptyState } from "../components/LoadingState";
import { Search, Plus, UserCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function Founders() {
  const [founders, setFounders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchFounders(); }, []);

  const fetchFounders = () => {
    setLoading(true);
    let url = `${API_URL}/api/founders`;
    if (search) url += `?search=${encodeURIComponent(search)}`;
    fetch(url).then(r => r.json()).then(data => {
      setFounders(data.founders || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  if (loading) return <LoadingState message="Loading founders..." />;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Founders</h1>
        <Link to="/founders/new" className="btn btn-primary"><Plus size={18} /> Add Founder</Link>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); fetchFounders(); }} className="search-form">
        <input type="text" placeholder="Search founders..." value={search} onChange={e => setSearch(e.target.value)} />
        <button type="submit"><Search size={18} /></button>
      </form>
      {founders.length === 0 ? <EmptyState message="No founders found" /> : (
        <div className="card-grid">
          {founders.map((f: any) => (
            <Link key={f.id} to={`/founders/${f.id}`} className="card founder-card">
              <div className="card-header">
                <UserCircle size={40} className="founder-icon" />
                <div className="card-title-group">
                  <h3>{f.name}</h3>
                  <span className="badge badge-role">{f.role}</span>
                </div>
              </div>
              <p className="card-description">{f.background}</p>
              {f.companies?.length > 0 && (
                <div className="tag-group">{f.companies.map((c: any) => <span key={c.id} className="tag">{c.name}</span>)}</div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}