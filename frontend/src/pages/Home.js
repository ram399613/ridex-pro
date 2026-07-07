import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import VehicleCard from '../components/VehicleCard';

const categories = [
  { key: 'bike', name: 'Bikes', icon: 'fa-motorcycle', desc: 'Sports & touring' },
  { key: 'scooter', name: 'Scooters', icon: 'fa-bicycle', desc: 'City commutes' },
  { key: 'car', name: 'Cars', icon: 'fa-car', desc: 'Family & travel' },
  { key: 'luxury', name: 'Luxury', icon: 'fa-gem', desc: 'Premium rides' },
];

const Home = () => {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [counts, setCounts] = useState({});

  useEffect(() => {
    api.get('/vehicles').then(({ data }) => {
      setFeatured(data.slice(0, 6));
      const c = {}; data.forEach(v => { c[v.type] = (c[v.type] || 0) + 1; });
      setCounts(c);
    }).catch(() => {});

    const onVehicleUpdated = (e) => {
      const v = e.detail;
      setFeatured(prev => prev.map(x => x._id === v._id ? v : x));
    };
    window.addEventListener('ridex:vehicle-updated', onVehicleUpdated);
    return () => window.removeEventListener('ridex:vehicle-updated', onVehicleUpdated);
  }, []);

  return (
    <>
      <section className="hero" data-testid="hero-section">
        <div className="hero-bg"><div className="hero-grid-overlay"></div></div>
        <div className="hero-content">
          <div className="hero-inner">
            <div>
              <div className="hero-label"><i className="fa-solid fa-bolt"></i> Real-time availability · No hidden fees</div>
              <h1 className="hero-title">Rent Any Ride,<span className="highlight">Anytime, Anywhere.</span></h1>
              <p className="hero-desc">Bikes, scooters, cars & luxury rides — book in seconds and hit the road. Live availability, instant confirmation, transparent pricing.</p>
              <div className="hero-actions">
                <button className="btn btn-primary btn-lg" onClick={() => navigate('/vehicles')} data-testid="hero-browse-btn">Browse Vehicles <i className="fa-solid fa-arrow-right"></i></button>
                <Link to="/contact" className="btn btn-outline btn-lg" data-testid="hero-contact-btn">Get in Touch</Link>
              </div>
              <div className="hero-stats">
                <div><div className="hero-stat-value">16+</div><div className="hero-stat-label">Vehicles</div></div>
                <div><div className="hero-stat-value">4</div><div className="hero-stat-label">Categories</div></div>
                <div><div className="hero-stat-value">24/7</div><div className="hero-stat-label">Support</div></div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-img-wrap">
                <img src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200&q=80" alt="ride" />
                <div className="hero-img-overlay"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section container" data-testid="categories-section">
        <div className="section-header">
          <div className="section-badge">Categories</div>
          <h2 className="section-title">Choose Your <span>Ride</span></h2>
          <p className="section-desc">From daily commuters to weekend cruisers — we've got you covered.</p>
        </div>
        <div className="categories-grid">
          {categories.map(c => (
            <div key={c.key} className="category-card" onClick={() => navigate(`/vehicles?type=${c.key}`)} data-testid={`category-${c.key}`}>
              <div className="category-icon"><i className={`fa-solid ${c.icon}`}></i></div>
              <div className="category-name">{c.name}</div>
              <div className="category-count">{counts[c.key] || 0} available</div>
              <div className="category-price">{c.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section container" data-testid="featured-section">
        <div className="section-header">
          <div className="section-badge">Featured</div>
          <h2 className="section-title">Popular <span>Vehicles</span></h2>
          <p className="section-desc">Handpicked rides riders love most.</p>
        </div>
        <div className="vehicles-grid">
          {featured.map(v => <VehicleCard key={v._id} v={v} />)}
        </div>
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link to="/vehicles" className="btn btn-outline">View All Vehicles <i className="fa-solid fa-arrow-right"></i></Link>
        </div>
      </section>
    </>
  );
};

export default Home;
