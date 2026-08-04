import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { LoadingState } from "../components/LoadingState";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function InvestorEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/investors/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setForm(data);
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`${API_URL}/api/investors/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        aum: parseInt(form.aum),
        founded: parseInt(form.founded),
      }),
    });
    setSaving(false);
    if (res.ok) navigate(`/investors/${id}`);
    else alert("Failed to update");
  };

  if (loading) return <LoadingState message="Loading..." />;
  if (!form) return <div>Not found</div>;

  return (
    <div className="page form-page">
      <Link to={`/investors/${id}`} className="back-link">
        <ArrowLeft size={18} /> Back
      </Link>
      <h1>Edit Investor</h1>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-row">
          <label>
            Name
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label>
            Type
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option>Venture Capital</option>
              <option>Accelerator</option>
              <option>Hedge Fund / Growth</option>
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            AUM ($)
            <input
              type="number"
              required
              value={form.aum}
              onChange={(e) => setForm({ ...form, aum: e.target.value })}
            />
          </label>
          <label>
            Founded Year
            <input
              type="number"
              required
              value={form.founded}
              onChange={(e) => setForm({ ...form, founded: e.target.value })}
            />
          </label>
        </div>
        <div className="form-row">
          <label>
            Headquarters
            <input
              required
              value={form.headquarters}
              onChange={(e) =>
                setForm({ ...form, headquarters: e.target.value })
              }
            />
          </label>
          <label>
            Focus
            <input
              required
              value={form.focus}
              onChange={(e) => setForm({ ...form, focus: e.target.value })}
            />
          </label>
        </div>
        <label>
          Logo
          <input
            required
            maxLength={4}
            value={form.logo}
            onChange={(e) =>
              setForm({ ...form, logo: e.target.value.toUpperCase() })
            }
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
