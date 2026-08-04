import React from "react";
import { Link } from "react-router";
import { TrendingUp, Users, MapPin } from "lucide-react";

function StartupCard({ startup }) {
  const formatValuation = (v) => {
    if (v >= 1000000000) return `$${(v / 1000000000).toFixed(1)}B`;
    if (v >= 1000000) return `$${(v / 1000000).toFixed(0)}M`;
    return `$${(v / 1000).toFixed(0)}K`;
  };

  return (
    <Link to={`/startups/${startup.id}`} className="card startup-card">
      <div className="card-header">
        <div
          className="logo"
          style={{
            background: `hsl(${startup.id.charCodeAt(1) * 30}, 70%, 45%)`,
          }}
        >
          {startup.logo}
        </div>
        <div className="card-title-group">
          <h3>{startup.name}</h3>
          <span className="badge badge-stage">{startup.stage}</span>
        </div>
      </div>
      <p className="card-description">{startup.description}</p>
      <div className="card-meta">
        <span className="meta-item">
          <TrendingUp size={14} />
          {formatValuation(startup.valuation)}
        </span>
        <span className="meta-item">
          <Users size={14} />
          {startup.employees}
        </span>
        <span className="meta-item">
          <MapPin size={14} />
          {startup.headquarters?.split(",")[0]}
        </span>
      </div>
      {startup.markets && startup.markets.length > 0 && (
        <div className="tag-group">
          {startup.markets.slice(0, 3).map((m) => (
            <span key={m} className="tag">
              {m}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

export default StartupCard;
