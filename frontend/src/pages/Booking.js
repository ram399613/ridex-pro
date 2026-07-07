import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const today = () => new Date().toISOString().slice(0, 10);
const tomorrow = () => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); };

const COUPONS = { RIDE10: 10, RIDE20: 20, FIRST50: 50 };

const Booking = () => {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [v, setV] = useState(null);
  const [form, setForm] = useState({
    pickupLocation: 'Koramangala, Bangalore',
    dropLocation: 'Koramangala, Bangalore',
    pickupDate: today(),
    returnDate: tomorrow(),
    couponCode: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => { api.get(`/vehicles/${vehicleId}`).then(({ data }) => setV(data)); }, [vehicleId]);

  const upd = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const totals = useMemo(() => {
    if (!v) return { days: 0, base: 0, discount: 0, total: 0 };
    const days = Math.max(1, Math.ceil((new Date(form.returnDate) - new Date(form.pickupDate)) / (1000 * 60 * 60 * 24)));
    const base = v.pricePerDay * days;
    const pct = COUPONS[form.couponCode.toUpperCase()] || 0;
    const discount = Math.round(base * pct / 100);
    return { days, base, discount, total: base - discount };
  }, [v, form]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/bookings', { vehicleId, ...form });
      showToast('Booking created!', 'success');
      navigate(`/payment/${data._id}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to book', 'error');
    } finally { setLoading(false); }
  };

  if (!v) return <div style={{ paddingTop: 120 }}><div className="spinner"></div></div>;

  return (
    <>
      <header className="page-header">
        <div className="container">
          <div className="breadcrumb"><Link to="/">Home</Link> / <Link to="/vehicles">Vehicles</Link> / <span>Booking</span></div>
          <h1>Complete your <span style={{ color: 'var(--orange)' }}>booking</span></h1>
        </div>
      </header>
      <section className="section container" data-testid="booking-page">
        <div className="two-col">
          <form className="card card-body" onSubmit={submit} style={{ padding: 32 }}>
            <h3 style={{ marginBottom: 20 }}>Trip details</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Pickup location</label>
                <input className="form-control" value={form.pickupLocation} onChange={upd('pickupLocation')} required data-testid="pickup-location" />
              </div>
              <div className="form-group">
                <label className="form-label">Drop location</label>
                <input className="form-control" value={form.dropLocation} onChange={upd('dropLocation')} required data-testid="drop-location" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Pickup date</label>
                <input className="form-control" type="date" value={form.pickupDate} onChange={upd('pickupDate')} required min={today()} data-testid="pickup-date" />
              </div>
              <div className="form-group">
                <label className="form-label">Return date</label>
                <input className="form-control" type="date" value={form.returnDate} onChange={upd('returnDate')} required min={form.pickupDate} data-testid="return-date" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Coupon code (RIDE10, RIDE20, FIRST50)</label>
              <input className="form-control" value={form.couponCode} onChange={upd('couponCode')} placeholder="Optional" data-testid="coupon-code" />
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-control" rows="3" value={form.notes} onChange={upd('notes')} data-testid="booking-notes" />
            </div>
            <button className="btn btn-primary btn-block btn-lg" disabled={loading || !v.available} data-testid="confirm-booking-btn">
              {loading ? 'Booking…' : `Proceed to Payment · ₹${totals.total}`}
            </button>
            {!v.available && <div className="form-error" style={{ marginTop: 10 }}>This vehicle just got booked.</div>}
          </form>

          <div>
            <div className="card" data-testid="booking-summary">
              <img src={v.images?.[0]} alt={v.name} style={{ width: '100%', height: 220, objectFit: 'cover' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
              <div className="card-body">
                <h3>{v.name}</h3>
                <p style={{ marginBottom: 12 }}>{v.brand} · {v.type}</p>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span>Rate</span><span>₹{v.pricePerDay}/day</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span>Days</span><span>{totals.days}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span>Subtotal</span><span>₹{totals.base}</span></div>
                  {totals.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: 'var(--success)' }}><span>Discount</span><span>-₹{totals.discount}</span></div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border)', fontWeight: 800, fontSize: '1.1rem' }}>
                    <span>Total</span><span style={{ color: 'var(--orange)' }} data-testid="booking-total">₹{totals.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Booking;
