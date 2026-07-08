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
    } catch (err) { showToast(err.response?.data?.message || 'Payment failed', 'error'); }
    finally { setLoading(false); }
  };

  if (!booking) return <div className="pt-32"><div className="spinner"></div></div>;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=ridex@upi&pn=RideX&am=${booking.totalAmount}`;

  return (
    <>
      <header className="pt-28 pb-10 bg-ink-900/80 border-b border-ink-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2 text-xs text-muted-faint mb-3"><Link to="/" className="hover:text-brand">Home</Link> / <Link to="/my-bookings" className="hover:text-brand">Bookings</Link> / <span className="text-white">Payment</span></div>
          <h1 className="text-4xl font-extrabold">Complete your <span className="text-brand">payment</span></h1>
        </div>
      </header>
      <section className="py-16 max-w-7xl mx-auto px-6" data-testid="payment-page">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="card-flat p-8">
            <div className="flex gap-1 bg-ink-900 rounded-lg p-1 mb-6">
              {METHODS.map(m => (
                <button key={m.id} type="button" onClick={() => setMethod(m.id)} className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${method === m.id ? 'bg-ink-800 text-white shadow-card' : 'text-muted-faint hover:text-white'}`} data-testid={`pay-tab-${m.id}`}>
                  <i className={`fa-solid ${m.icon} mr-1.5`}></i> {m.label}
                </button>
              ))}
            </div>

            {method === 'upi' && (
              <div className="flex flex-col items-center gap-4 p-6 bg-ink-900 border border-ink-700 rounded-xl" data-testid="upi-panel">
                <div className="w-44 h-44 bg-white rounded-xl overflow-hidden"><img src={qrUrl} alt="qr" /></div>
                <div className="text-center">
                  <div className="font-bold">Scan to pay ₹{booking.totalAmount}</div>
                  <div className="text-xs text-muted-faint">UPI ID: ridex@upi</div>
                </div>
                <div className="flex gap-3 flex-wrap justify-center">
                  {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(a => (
                    <div key={a} className="flex flex-col items-center gap-1.5 p-3 min-w-[72px] bg-ink-800 border border-ink-700 rounded-lg text-xs text-muted-faint hover:border-brand hover:text-brand transition-colors cursor-pointer">
                      <i className="fa-solid fa-mobile-screen text-xl"></i>{a}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {method === 'card' && (
              <div data-testid="card-panel">
                <div className="mb-4"><label className="form-label">Card number</label><input className="form-control" placeholder="4242 4242 4242 4242" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} /></div>
                <div className="mb-4"><label className="form-label">Cardholder name</label><input className="form-control" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div><label className="form-label">Expiry</label><input className="form-control" placeholder="MM/YY" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} /></div>
                  <div><label className="form-label">CVV</label><input className="form-control" placeholder="123" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} /></div>
                </div>
              </div>
            )}

            {method === 'netbanking' && (
              <div data-testid="nb-panel">
                <label className="form-label">Select bank</label>
                <select className="form-control"><option>HDFC Bank</option><option>ICICI Bank</option><option>SBI</option><option>Axis Bank</option><option>Kotak</option></select>
              </div>
            )}

            {method === 'cash' && <div className="form-hint" data-testid="cash-panel">Pay ₹{booking.totalAmount} at pickup. Your booking will still be confirmed instantly.</div>}

            <button className="btn-primary btn-block btn-lg mt-6" onClick={pay} disabled={loading} data-testid="pay-now-btn">
              {loading ? 'Processing…' : `Pay ₹${booking.totalAmount}`}
            </button>
          </div>

          <div className="card-flat p-6" data-testid="payment-summary">
            <h3 className="text-lg font-bold mb-4">Order summary</h3>
            <div className="flex gap-3 mb-4">
              <img src={booking.vehicle?.images?.[0]} alt="" className="w-20 h-20 rounded-lg object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
              <div>
                <div className="font-bold">{booking.vehicle?.name}</div>
                <div className="text-sm text-muted-faint">{booking.vehicle?.brand}</div>
              </div>
            </div>
            <div className="border-t border-ink-700 pt-3 space-y-2 text-sm text-muted">
              <div className="flex justify-between"><span>Pickup</span><span>{new Date(booking.pickupDate).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span>Return</span><span>{new Date(booking.returnDate).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span>Days</span><span>{booking.totalDays}</span></div>
              {booking.discount > 0 && <div className="flex justify-between text-green-400"><span>Discount</span><span>-₹{booking.discount}</span></div>}
              <div className="flex justify-between pt-3 mt-1 border-t border-ink-700 font-extrabold text-lg text-white">
                <span>Total</span><span className="text-brand">₹{booking.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Payment;
