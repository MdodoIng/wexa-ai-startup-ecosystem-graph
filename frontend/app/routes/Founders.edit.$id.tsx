import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { LoadingState } from "../components/LoadingState";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function FounderEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/founders/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setForm(data);
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`${API_URL}/api/founders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) navigate(`/founders/${id}`);
    else alert("Failed to update");
  };

  if (loading) return <LoadingState message="Loading..." />;
  if (!form) return <div>Not found</div>;

  return (
    <div className="page form-page">
      <Link to={`/founders/${id}`} className="back-link">
        <ArrowLeft size={18} /> Back
      </Link>
      <h1>Edit Founder</h1>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Name
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label>
          Role
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option>CEO</option>
            <option>CTO</option>
            <option>COO</option>
            <option>CFO</option>
          </select>
        </label>
        <label>
          Background
          <textarea
            required
            value={form.background}
            onChange={(e) => setForm({ ...form, background: e.target.value })}
          />
        </label>
        <div className="form-row">
          <label>
            LinkedIn
            <input
              value={form.linkedin}
              onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
