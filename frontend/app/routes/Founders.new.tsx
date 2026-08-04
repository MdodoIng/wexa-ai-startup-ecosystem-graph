import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { ArrowLeft } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function FounderNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ id: "", name: "", role: "CEO", background: "", linkedin: "", email: "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`${API_URL}/api/founders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setSaving(false);
    if (res.ok) navigate("/founders");
    else alert("Failed to create founder");
  };

  return (
    <div className="page form-page">
      <Link to="/founders" className="back-link"><ArrowLeft size={18} /> Back</Link>
      <h1>Add New Founder</h1>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-row">
          <label>ID<input required value={form.id} onChange={e => setForm({...form, id: e.target.value})} /></label>
          <label>Name<input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></label>
        </div>
        <label>Role
          <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
            <option>CEO</option><option>CTO</option><option>COO</option><option>CFO</option>
          </select>
        </label>
        <label>Background<textarea required value={form.background} onChange={e => setForm({...form, background: e.target.value})} /></label>
        <div className="form-row">
          <label>LinkedIn<input value={form.linkedin} onChange={e => setForm({...form, linkedin: e.target.value})} /></label>
          <label>Email<input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></label>
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Create Founder"}</button>
      </form>
    </div>
  );
}