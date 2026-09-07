import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaArrowUp } from "react-icons/fa";
import "./UIFooter.css";

const UIFooter = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="ui-footer">
      <div className="footer-content">
        <div className="footer-section">
          <Link to="/ERPHomepage" className="footer-logo">
            <div className="logo-dot"></div>
            Patel Industries
          </Link>
          <p>
            Revolutionizing enterprise operations with state-of-the-art ERP solutions. 
            Empowering modern manufacturing since 2010.
          </p>
          <div className="footer-socials">
            <a href="#" className="social-icon"><FaFacebookF /></a>
            <a href="#" className="social-icon"><FaTwitter /></a>
            <a href="#" className="social-icon"><FaLinkedinIn /></a>
            <a href="#" className="social-icon"><FaInstagram /></a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/ERPHomepage">Home</Link></li>
            <li><Link to="/AboutUsPage">About Us</Link></li>
            <li><Link to="/ServicesPage">Services</Link></li>
            <li><Link to="/OurTeamPage">Our Team</Link></li>
            <li><Link to="/ClientsPage">Clients</Link></li>
            <li><Link to="/ContactUsPage">Contact Us</Link></li>
            <li><Link to="/login">Sign In</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Services</h4>
          <ul className="footer-links">
            <li><a href="#">Inventory Management</a></li>
            <li><a href="#">Human Resources</a></li>
            <li><a href="#">Financial Management</a></li>
            <li><a href="#">Supply Chain</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact Us</h4>
          <p>
            123 Industrial Estate,<br />
            Ahmedabad, Gujarat 380001<br />
            Email: contact@patelindustries.com<br />
            Phone: +91 (800) 123-4567
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Patel Industries. All Rights Reserved.</p>
        <div style={{ display: 'flex', gap: '20px' }}>
          <a href="#" className="footer-links" style={{ fontSize: '0.85rem' }}>Privacy Policy</a>
          <a href="#" className="footer-links" style={{ fontSize: '0.85rem' }}>Terms of Service</a>
        </div>
        <button 
          onClick={scrollToTop}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: 'none',
            color: 'white',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: '0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#3b82f6'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        >
          <FaArrowUp />
        </button>
      </div>
    </footer>
  );
};

export default UIFooter;
