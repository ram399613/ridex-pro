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

  if (loading) return <div style={{ paddingTop: 120 }}><div className="spinner"></div></div>;
  if (!v) return <div className="empty-state" style={{ paddingTop: 140 }}><i className="fa-solid fa-triangle-exclamation"></i>Vehicle not found.</div>;

  const rating = v.rating || 4.5;
  const stars = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));

  return (
    <>
      <header className="page-header">
        <div className="container">
          <div className="breadcrumb"><Link to="/">Home</Link> / <Link to="/vehicles">Vehicles</Link> / <span>{v.name}</span></div>
        </div>
      </header>
      <section className="section container" data-testid="vehicle-details">
        <div className="two-col">
          <div className="card" style={{ overflow: 'hidden' }}>
            <img src={v.images?.[0]} alt={v.name} style={{ width: '100%', height: 420, objectFit: 'cover' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </div>
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <span className="vehicle-badge" style={{ position: 'static' }}>{v.type}</span>
              <span className={`vehicle-avail ${v.available ? 'available' : 'unavailable'}`} style={{ position: 'static' }} data-testid="vehicle-availability">
                {v.available ? '● Available' : '● Booked'}
              </span>
            </div>
            <h1 style={{ marginBottom: 8 }}>{v.name}</h1>
            <p style={{ marginBottom: 12 }}>{v.brand} · {v.color}</p>
            <div className="vehicle-rating" style={{ marginBottom: 20 }}>
              <span className="stars">{stars}</span>
              <span className="rating-count">{rating} · {v.totalReviews || 0} reviews</span>
            </div>
            <div className="vehicle-price" style={{ marginBottom: 24 }}>
              <span className="price-amount" style={{ fontSize: '2.4rem' }}>₹{v.pricePerDay}</span>
              <span className="price-unit">/day</span>
            </div>
            <p style={{ marginBottom: 24 }}>{v.description}</p>

            <div className="card-body" style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: 20 }}>
              <div className="footer-title" style={{ marginBottom: 12 }}>Specifications</div>
              <div className="three-col" style={{ gap: 12 }}>
                <div><div className="stat-label">Engine</div><div className="vehicle-name">{v.specs?.engine || '—'}</div></div>
                <div><div className="stat-label">Mileage</div><div className="vehicle-name">{v.specs?.mileage || '—'}</div></div>
                <div><div className="stat-label">Transmission</div><div className="vehicle-name">{v.specs?.transmission}</div></div>
                <div><div className="stat-label">Fuel</div><div className="vehicle-name">{v.specs?.fuelType}</div></div>
                <div><div className="stat-label">Seats</div><div className="vehicle-name">{v.specs?.seats}</div></div>
                <div><div className="stat-label">Power</div><div className="vehicle-name">{v.specs?.power || '—'}</div></div>
              </div>
            </div>

            <button className="btn btn-primary btn-lg btn-block" onClick={bookNow} disabled={!v.available} data-testid="book-now-btn">
              {v.available ? 'Book Now' : 'Not Available'} <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default VehicleDetails;
