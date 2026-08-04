import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { ArrowLeft } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function InvestorNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ id: "", name: "", type: "Venture Capital", aum: "", founded: "", headquarters: "", focus: "", logo: "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`${API_URL}/api/investors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, aum: parseInt(form.aum), founded: parseInt(form.founded) })
    });
    setSaving(false);
    if (res.ok) navigate("/investors");
    else alert("Failed to create investor");
  };

  return (
    <div className="page form-page">
      <Link to="/investors" className="back-link"><ArrowLeft size={18} /> Back</Link>
      <h1>Add New Investor</h1>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-row">
          <label>ID<input required value={form.id} onChange={e => setForm({...form, id: e.target.value})} /></label>
          <label>Name<input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></label>
        </div>
        <div className="form-row">
          <label>Type
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              <option>Venture Capital</option><option>Accelerator</option><option>Hedge Fund / Growth</option>
            </select>
          </label>
          <label>AUM ($)<input type="number" required value={form.aum} onChange={e => setForm({...form, aum: e.target.value})} /></label>
          <label>Founded Year<input type="number" required value={form.founded} onChange={e => setForm({...form, founded: e.target.value})} /></label>
        </div>
        <div className="form-row">
          <label>Headquarters<input required value={form.headquarters} onChange={e => setForm({...form, headquarters: e.target.value})} /></label>
          <label>Focus<input required value={form.focus} onChange={e => setForm({...form, focus: e.target.value})} /></label>
        </div>
        <label>Logo (2-4 letters)<input required maxLength={4} value={form.logo} onChange={e => setForm({...form, logo: e.target.value.toUpperCase()})} /></label>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Create Investor"}</button>
      </form>
    </div>
  );
}