import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [v, setV] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/vehicles/${id}`).then(({ data }) => setV(data)).catch(() => setV(null)).finally(() => setLoading(false));
    const onUpdated = (e) => { if (e.detail._id === id) setV(e.detail); };
    window.addEventListener('ridex:vehicle-updated', onUpdated);
    return () => window.removeEventListener('ridex:vehicle-updated', onUpdated);
  }, [id]);

  const bookNow = () => {
    if (!user) { showToast('Please log in to book', 'info'); navigate('/login'); return; }
    if (!v.available) { showToast('This vehicle is currently booked', 'error'); return; }
    navigate(`/booking/${v._id}`);
  };

  if (loading) return <div className="pt-32"><div className="spinner"></div></div>;
  if (!v) return <div className="text-center pt-36 text-muted-faint"><i className="fa-solid fa-triangle-exclamation text-5xl block mb-4"></i>Vehicle not found.</div>;

  const rating = v.rating || 4.5;
  const stars = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  const specs = [
    ['Engine', v.specs?.engine], ['Mileage', v.specs?.mileage], ['Transmission', v.specs?.transmission],
    ['Fuel', v.specs?.fuelType], ['Seats', v.specs?.seats], ['Power', v.specs?.power],
  ];

  return (
    <>
      <header className="pt-28 pb-10 bg-ink-900/80 border-b border-ink-700">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 text-xs text-muted-faint">
          <Link to="/" className="hover:text-brand">Home</Link> / <Link to="/vehicles" className="hover:text-brand">Vehicles</Link> / <span className="text-white">{v.name}</span>
        </div>
      </header>
      <section className="py-16 max-w-7xl mx-auto px-6" data-testid="vehicle-details">
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="card-flat">
            <img src={v.images?.[0]} alt={v.name} className="w-full h-[420px] object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
          </div>
          <div>
            <div className="flex gap-2.5 mb-3">
              <span className="px-3 py-1 bg-brand text-white rounded-full text-xs font-semibold capitalize">{v.type}</span>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${v.available ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-red-500/15 text-red-400 border-red-500/30'}`} data-testid="vehicle-availability">
                ● {v.available ? 'Available' : 'Booked'}
              </span>
            </div>
            <h1 className="text-4xl font-extrabold mb-2">{v.name}</h1>
            <p className="text-muted mb-3">{v.brand} · {v.color}</p>
            <div className="flex items-center gap-2 mb-5">
              <span className="text-amber-400 text-lg">{stars}</span>
              <span className="text-xs text-muted-faint">{rating} · {v.totalReviews || 0} reviews</span>
            </div>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-5xl font-extrabold text-brand">₹{v.pricePerDay}</span>
              <span className="text-sm text-muted-faint">/day</span>
            </div>
            <p className="text-muted mb-6">{v.description}</p>

            <div className="bg-ink-900 border border-ink-700 rounded-xl p-5 mb-5">
              <div className="text-sm font-bold uppercase tracking-wider mb-3">Specifications</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {specs.map(([label, val]) => (
                  <div key={label}>
                    <div className="text-[11px] text-muted-faint">{label}</div>
                    <div className="font-bold">{val || '—'}</div>
                  </div>
                ))}
              </div>
            </div>

            <button className="btn-primary btn-lg btn-block" onClick={bookNow} disabled={!v.available} data-testid="book-now-btn">
              {v.available ? 'Book Now' : 'Not Available'} <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default VehicleDetails;
