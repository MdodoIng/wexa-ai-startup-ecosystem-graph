import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { ArrowLeft } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function StartupNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    id: "", name: "", description: "", stage: "Seed", valuation: "", employees: "",
    founded: "", headquarters: "", website: "", logo: ""
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`${API_URL}/api/startups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, valuation: parseInt(form.valuation), employees: parseInt(form.employees) })
    });
    setSaving(false);
    if (res.ok) {
      navigate("/startups");
    } else {
      alert("Failed to create startup");
    }
  };

  return (
    <div className="page form-page">
      <Link to="/startups" className="back-link"><ArrowLeft size={18} /> Back to Startups</Link>
      <h1>Add New Startup</h1>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-row">
          <label>ID (unique)<input required value={form.id} onChange={e => setForm({ ...form, id: e.target.value })} /></label>
          <label>Name<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
        </div>
        <label>Description<textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
        <div className="form-row">
          <label>Stage
            <select value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })}>
              <option>Seed</option><option>Series A</option><option>Series B</option><option>Series C</option><option>Series D</option>
            </select>
          </label>
          <label>Valuation ($)<input type="number" required value={form.valuation} onChange={e => setForm({ ...form, valuation: e.target.value })} /></label>
          <label>Employees<input type="number" required value={form.employees} onChange={e => setForm({ ...form, employees: e.target.value })} /></label>
        </div>
        <div className="form-row">
          <label>Founded Year<input required value={form.founded} onChange={e => setForm({ ...form, founded: e.target.value })} /></label>
          <label>Headquarters<input required value={form.headquarters} onChange={e => setForm({ ...form, headquarters: e.target.value })} /></label>
        </div>
        <div className="form-row">
          <label>Website<input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} /></label>
          <label>Logo (2 letters)<input required maxLength={2} value={form.logo} onChange={e => setForm({ ...form, logo: e.target.value.toUpperCase() })} /></label>
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Create Startup"}</button>
      </form>
    </div>
  );
}