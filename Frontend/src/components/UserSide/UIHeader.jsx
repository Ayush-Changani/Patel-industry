import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./UIHeader.css";
import logo from "../../assets/patel_lindustry_logo.png";

const UIHeader = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="ui-header">
      <Link to="/ERPHomepage" className="logo" style={{ display: "flex", alignItems: "center" }}>
        <img src={logo} alt="Patel Industries Logo" style={{ height: "68px", objectFit: "contain" }} />
      </Link>

      <nav>
        <Link 
          to="/ERPHomepage" 
          className={`nav-link ${isActive("/ERPHomepage") ? "active" : ""}`}
        >
          Home
        </Link>
        <Link 
          to="/AboutUsPage" 
          className={`nav-link ${isActive("/AboutUsPage") ? "active" : ""}`}
        >
          About Us
        </Link>
        <Link 
          to="/ServicesPage" 
          className={`nav-link ${isActive("/ServicesPage") ? "active" : ""}`}
        >
          Services
        </Link>
        <Link 
          to="/OurTeamPage" 
          className={`nav-link ${isActive("/OurTeamPage") ? "active" : ""}`}
        >
          Our Team
        </Link>
        <Link 
          to="/ClientsPage" 
          className={`nav-link ${isActive("/ClientsPage") ? "active" : ""}`}
        >
          Clients
        </Link>
        <Link 
          to="/ContactUsPage" 
          className={`nav-link ${isActive("/ContactUsPage") ? "active" : ""}`}
        >
          Contact Us
        </Link>
      </nav>

      <div className="auth-buttons">
        <Link to="/login" className="login-btn">
          Sign In
        </Link>
      </div>
    </header>
  );
};

export default UIHeader;
