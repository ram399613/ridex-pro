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
    } catch (err) { showToast(err.response?.data?.message || 'Failed to book', 'error'); }
    finally { setLoading(false); }
  };

  if (!v) return <div className="pt-32"><div className="spinner"></div></div>;

  return (
    <>
      <header className="pt-28 pb-10 bg-ink-900/80 border-b border-ink-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2 text-xs text-muted-faint mb-3"><Link to="/" className="hover:text-brand">Home</Link> / <Link to="/vehicles" className="hover:text-brand">Vehicles</Link> / <span className="text-white">Booking</span></div>
          <h1 className="text-4xl font-extrabold">Complete your <span className="text-brand">booking</span></h1>
        </div>
      </header>
      <section className="py-16 max-w-7xl mx-auto px-6" data-testid="booking-page">
        <div className="grid lg:grid-cols-2 gap-8">
          <form className="card-flat p-8" onSubmit={submit}>
            <h3 className="text-xl font-bold mb-5">Trip details</h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="form-label">Pickup location</label>
                <input className="form-control" value={form.pickupLocation} onChange={upd('pickupLocation')} required data-testid="pickup-location" />
              </div>
              <div>
                <label className="form-label">Drop location</label>
                <input className="form-control" value={form.dropLocation} onChange={upd('dropLocation')} required data-testid="drop-location" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="form-label">Pickup date</label>
                <input className="form-control" type="date" value={form.pickupDate} onChange={upd('pickupDate')} required min={today()} data-testid="pickup-date" />
              </div>
              <div>
                <label className="form-label">Return date</label>
                <input className="form-control" type="date" value={form.returnDate} onChange={upd('returnDate')} required min={form.pickupDate} data-testid="return-date" />
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label">Coupon code (RIDE10, RIDE20, FIRST50)</label>
              <input className="form-control" value={form.couponCode} onChange={upd('couponCode')} placeholder="Optional" data-testid="coupon-code" />
            </div>
            <div className="mb-5">
              <label className="form-label">Notes</label>
              <textarea className="form-control" rows="3" value={form.notes} onChange={upd('notes')} data-testid="booking-notes" />
            </div>
            <button className="btn-primary btn-block btn-lg" disabled={loading || !v.available} data-testid="confirm-booking-btn">
              {loading ? 'Booking…' : `Proceed to Payment · ₹${totals.total}`}
            </button>
            {!v.available && <div className="form-error mt-2.5">This vehicle just got booked.</div>}
          </form>

          <div className="card-flat" data-testid="booking-summary">
            <img src={v.images?.[0]} alt={v.name} className="w-full h-56 object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
            <div className="p-6">
              <h3 className="text-lg font-bold">{v.name}</h3>
              <p className="text-muted mb-3">{v.brand} · {v.type}</p>
              <div className="border-t border-ink-700 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-muted"><span>Rate</span><span>₹{v.pricePerDay}/day</span></div>
                <div className="flex justify-between text-muted"><span>Days</span><span>{totals.days}</span></div>
                <div className="flex justify-between text-muted"><span>Subtotal</span><span>₹{totals.base}</span></div>
                {totals.discount > 0 && <div className="flex justify-between text-green-400"><span>Discount</span><span>-₹{totals.discount}</span></div>}
                <div className="flex justify-between pt-3 mt-2 border-t border-ink-700 font-extrabold text-lg text-white">
                  <span>Total</span><span className="text-brand" data-testid="booking-total">₹{totals.total}</span>
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
