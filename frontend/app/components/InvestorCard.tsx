import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Building2 } from 'lucide-react';

function InvestorCard({ investor }) {
  const formatAUM = (v) => {
    if (v >= 1000000000) return `$${(v / 1000000000).toFixed(0)}B`;
    if (v >= 1000000) return `$${(v / 1000000).toFixed(0)}M`;
    return `$${v}`;
  };

  return (
    <Link to={`/investors/${investor.id}`} className="card investor-card">
      <div className="card-header">
        <div className="logo" style={{ background: `hsl(${investor.id.charCodeAt(1) * 40 + 180}, 70%, 40%)` }}>
          {investor.logo}
        </div>
        <div className="card-title-group">
          <h3>{investor.name}</h3>
          <span className="badge badge-type">{investor.type}</span>
        </div>
      </div>
      <div className="card-meta">
        <span className="meta-item">
          <Wallet size={14} />
          AUM: {formatAUM(investor.aum)}
        </span>
        <span className="meta-item">
          <Building2 size={14} />
          {investor.portfolioSize} portfolio companies
        </span>
      </div>
      <p className="focus-text">Focus: {investor.focus}</p>
    </Link>
  );
}

export default InvestorCard;