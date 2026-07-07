import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const METHODS = [
  { id: 'upi', label: 'UPI', icon: 'fa-mobile-screen' },
  { id: 'card', label: 'Card', icon: 'fa-credit-card' },
  { id: 'netbanking', label: 'Netbanking', icon: 'fa-building-columns' },
  { id: 'cash', label: 'Cash on pickup', icon: 'fa-money-bill' },
];

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [booking, setBooking] = useState(null);
  const [method, setMethod] = useState('upi');
  const [loading, setLoading] = useState(false);
  const [card, setCard] = useState({ number: '', name: '', exp: '', cvv: '' });

  useEffect(() => { api.get(`/bookings/${bookingId}`).then(({ data }) => setBooking(data)); }, [bookingId]);

  const pay = async () => {
    setLoading(true);
    try {
      await api.post('/payments/initiate', { bookingId, paymentMethod: method });
      const { data } = await api.post('/payments/verify', { bookingId, paymentMethod: method, transactionId: 'TXN_' + Date.now() });
      showToast(data.message || 'Payment successful!', 'success');
      navigate('/my-bookings');
    } catch (err) {
      showToast(err.response?.data?.message || 'Payment failed', 'error');
    } finally { setLoading(false); }
  };

  if (!booking) return <div style={{ paddingTop: 120 }}><div className="spinner"></div></div>;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=ridex@upi&pn=RideX&am=${booking.totalAmount}`;

  return (
    <>
      <header className="page-header">
        <div className="container">
          <div className="breadcrumb"><Link to="/">Home</Link> / <Link to="/my-bookings">Bookings</Link> / <span>Payment</span></div>
          <h1>Complete your <span style={{ color: 'var(--orange)' }}>payment</span></h1>
        </div>
      </header>
      <section className="section container" data-testid="payment-page">
        <div className="two-col">
          <div className="card card-body" style={{ padding: 32 }}>
            <div className="payment-method-tabs">
              {METHODS.map(m => (
                <button key={m.id} type="button" className={`pay-tab ${method === m.id ? 'active' : ''}`} onClick={() => setMethod(m.id)} data-testid={`pay-tab-${m.id}`}>
                  <i className={`fa-solid ${m.icon}`}></i> {m.label}
                </button>
              ))}
            </div>

            {method === 'upi' && (
              <div className="qr-wrap" data-testid="upi-panel">
                <div className="qr-code"><img src={qrUrl} alt="qr" /></div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700 }}>Scan to pay ₹{booking.totalAmount}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>UPI ID: ridex@upi</div>
                </div>
                <div className="upi-apps">
                  {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(a => (
                    <div key={a} className="upi-app"><span className="app-icon"><i className="fa-solid fa-mobile-screen"></i></span>{a}</div>
                  ))}
                </div>
              </div>
            )}

            {method === 'card' && (
              <div data-testid="card-panel">
                <div className="form-group">
                  <label className="form-label">Card number</label>
                  <input className="form-control" placeholder="4242 4242 4242 4242" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Cardholder name</label>
                  <input className="form-control" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Expiry</label>
                    <input className="form-control" placeholder="MM/YY" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVV</label>
                    <input className="form-control" placeholder="123" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} />
                  </div>
                </div>
              </div>
            )}

            {method === 'netbanking' && (
              <div data-testid="nb-panel">
                <div className="form-group">
                  <label className="form-label">Select bank</label>
                  <select className="form-control">
                    <option>HDFC Bank</option><option>ICICI Bank</option><option>SBI</option><option>Axis Bank</option><option>Kotak</option>
                  </select>
                </div>
              </div>
            )}

            {method === 'cash' && <div className="form-hint" data-testid="cash-panel">Pay ₹{booking.totalAmount} at pickup. Your booking will still be confirmed instantly.</div>}

            <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 20 }} onClick={pay} disabled={loading} data-testid="pay-now-btn">
              {loading ? 'Processing…' : `Pay ₹${booking.totalAmount}`}
            </button>
          </div>

          <div className="card" data-testid="payment-summary">
            <div className="card-body">
              <h3 style={{ marginBottom: 16 }}>Order summary</h3>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <img src={booking.vehicle?.images?.[0]} alt="" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
                <div>
                  <div style={{ fontWeight: 700 }}>{booking.vehicle?.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{booking.vehicle?.brand}</div>
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span>Pickup</span><span>{new Date(booking.pickupDate).toLocaleDateString()}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span>Return</span><span>{new Date(booking.returnDate).toLocaleDateString()}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span>Days</span><span>{booking.totalDays}</span></div>
                {booking.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: 'var(--success)' }}><span>Discount</span><span>-₹{booking.discount}</span></div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border)', fontWeight: 800, fontSize: '1.1rem' }}>
                  <span>Total</span><span style={{ color: 'var(--orange)' }}>₹{booking.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Payment;
