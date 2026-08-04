import { Link, useLocation } from "react-router";
import { Network, Rocket, Users, UserCircle, Search, Home, PlusCircle } from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  
  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/startups", label: "Startups", icon: Rocket },
    { path: "/investors", label: "Investors", icon: Users },
    { path: "/founders", label: "Founders", icon: UserCircle },
    { path: "/network", label: "Network", icon: Network },
    { path: "/queries", label: "Queries", icon: Search },
  ];

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Network size={24} />
        <span>StartupGraph</span>
      </div>
      <div className="nav-links">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${location.pathname === item.path ? "active" : ""}`}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}