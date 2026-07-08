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
    const onVehicleUpdated = (e) => setFeatured(prev => prev.map(x => x._id === e.detail._id ? e.detail : x));
    window.addEventListener('ridex:vehicle-updated', onVehicleUpdated);
    return () => window.removeEventListener('ridex:vehicle-updated', onVehicleUpdated);
  }, []);

  return (
    <>
      <section className="min-h-screen relative flex items-center overflow-hidden pt-16" data-testid="hero-section">
        <div className="absolute inset-0 bg-gradient-to-br from-ink-950/60 via-ink-900/60 to-orange-950/50" />
        <div className="absolute inset-0 bg-brand-glow" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(theme(colors.ink.700) 1px, transparent 1px), linear-gradient(90deg, theme(colors.ink.700) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[calc(100vh-4rem)]">
            <div>
              <div className="inline-flex items-center gap-2 bg-brand/15 border border-brand/25 text-brand rounded-full px-4 py-1.5 text-xs font-semibold mb-5">
                <i className="fa-solid fa-bolt"></i> Real-time availability · No hidden fees
              </div>
              <h1 className="text-5xl sm:text-6xl font-extrabold leading-[1.05] mb-5">Rent Any Ride,<span className="block text-brand">Anytime, Anywhere.</span></h1>
              <p className="text-lg text-muted leading-relaxed mb-8 max-w-lg">Bikes, scooters, cars & luxury rides — book in seconds and hit the road. Live availability, instant confirmation, transparent pricing.</p>
              <div className="flex flex-wrap gap-3 mb-12">
                <button className="btn-primary btn-lg" onClick={() => navigate('/vehicles')} data-testid="hero-browse-btn">Browse Vehicles <i className="fa-solid fa-arrow-right"></i></button>
                <Link to="/contact" className="btn-outline btn-lg" data-testid="hero-contact-btn">Get in Touch</Link>
              </div>
              <div className="flex gap-8">
                <div><div className="text-2xl font-extrabold">16+</div><div className="text-xs text-muted-faint">Vehicles</div></div>
                <div><div className="text-2xl font-extrabold">4</div><div className="text-xs text-muted-faint">Categories</div></div>
                <div><div className="text-2xl font-extrabold">24/7</div><div className="text-xs text-muted-faint">Support</div></div>
              </div>
            </div>
            <div className="hidden lg:block relative rounded-3xl overflow-hidden border border-ink-700 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              <img src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200&q=80" alt="ride" className="w-full h-[460px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-6" data-testid="categories-section">
        <div className="text-center mb-14">
          <div className="section-badge">Categories</div>
          <h2 className="text-3xl font-bold mb-4">Choose Your <span className="text-brand">Ride</span></h2>
          <p className="text-muted max-w-xl mx-auto">From daily commuters to weekend cruisers — we've got you covered.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map(c => (
            <div key={c.key} className="bg-ink-800 border border-ink-700 rounded-xl p-7 text-center cursor-pointer transition-all hover:border-brand hover:-translate-y-1 hover:shadow-card" onClick={() => navigate(`/vehicles?type=${c.key}`)} data-testid={`category-${c.key}`}>
              <div className="text-4xl mb-3.5 text-brand"><i className={`fa-solid ${c.icon}`}></i></div>
              <div className="font-bold text-base">{c.name}</div>
              <div className="text-xs text-muted-faint">{counts[c.key] || 0} available</div>
              <div className="text-xs text-brand mt-2 font-semibold">{c.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-6" data-testid="featured-section">
        <div className="text-center mb-14">
          <div className="section-badge">Featured</div>
          <h2 className="text-3xl font-bold mb-4">Popular <span className="text-brand">Vehicles</span></h2>
          <p className="text-muted max-w-xl mx-auto">Handpicked rides riders love most.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map(v => <VehicleCard key={v._id} v={v} />)}
        </div>
        <div className="text-center mt-8"><Link to="/vehicles" className="btn-outline">View All Vehicles <i className="fa-solid fa-arrow-right"></i></Link></div>
      </section>
    </>
  );
};

export default Home;
