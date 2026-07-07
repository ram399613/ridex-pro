import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="footer" data-testid="footer">
    <div className="footer-grid">
      <div className="footer-brand">
        <div className="logo">Ride<span>X</span></div>
        <p>Rent premium bikes, scooters, cars & luxury rides on demand. Real-time availability, instant confirmation.</p>
        <div className="footer-social">
          <a href="#" className="social-btn" aria-label="fb"><i className="fa-brands fa-facebook-f"></i></a>
          <a href="#" className="social-btn" aria-label="tw"><i className="fa-brands fa-twitter"></i></a>
          <a href="#" className="social-btn" aria-label="ig"><i className="fa-brands fa-instagram"></i></a>
          <a href="#" className="social-btn" aria-label="in"><i className="fa-brands fa-linkedin-in"></i></a>
        </div>
      </div>
      <div>
        <div className="footer-title">Explore</div>
        <div className="footer-links">
          <Link to="/vehicles?type=bike">Bikes</Link>
          <Link to="/vehicles?type=scooter">Scooters</Link>
          <Link to="/vehicles?type=car">Cars</Link>
          <Link to="/vehicles?type=luxury">Luxury</Link>
        </div>
      </div>
      <div>
        <div className="footer-title">Company</div>
        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/vehicles">Vehicles</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/dashboard">Dashboard</Link>
        </div>
      </div>
      <div>
        <div className="footer-title">Contact</div>
        <div className="footer-links">
          <span><i className="fa-solid fa-envelope"></i> support@ridex.com</span>
          <span><i className="fa-solid fa-phone"></i> +91 98765 43210</span>
          <span><i className="fa-solid fa-location-dot"></i> Bangalore, India</span>
        </div>
      </div>
    </div>
    <div className="footer-bottom">© {new Date().getFullYear()} RideX. Built for riders.</div>
  </footer>
);

export default Footer;
