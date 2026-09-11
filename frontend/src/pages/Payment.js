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
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setError('');
      try {
        const { data } = await api.get(`/bookings/${bookingId}`);
        if (active) setBooking(data);
      } catch (err) {
        if (active) setError(err.response?.data?.message || 'Unable to load this booking.');
      }
    };
    load();
    return () => { active = false; };
  }, [bookingId]);

  useEffect(() => {
    if (!booking) return undefined;
    let active = true;
    api.post('/payments/initiate', { bookingId, paymentMethod: method })
      .then(({ data }) => { if (active) setPaymentInfo(data); })
      .catch((err) => { if (active) setError(err.response?.data?.message || 'Unable to load payment details.'); });
    return () => { active = false; };
  }, [booking, bookingId, method]);

  const pay = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/payments/verify', { bookingId, paymentMethod: method, transactionId: 'TXN_' + Date.now() });
      showToast(data.message || 'Payment successful!', 'success');
      navigate('/my-bookings');
    } catch (err) { showToast(err.response?.data?.message || 'Payment failed', 'error'); }
    finally { setLoading(false); }
  };

  if (!booking) return <div className="pt-32">{error ? <div className="text-center text-muted-faint">{error}</div> : <div className="spinner"></div>}</div>;
  const upiId = paymentInfo?.upiId || '8712134359@ybl';
  const upiUriRaw = paymentInfo?.upiUri || `upi://pay?pa=${encodeURIComponent(upiId)}&pn=RideX%20Rentals&cu=INR`;
  const upiUri = upiUriRaw.includes('am=') ? upiUriRaw : `${upiUriRaw}&am=${encodeURIComponent(booking.totalAmount)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiUri)}`;
  const bank = paymentInfo?.bank;

  const copyUpiId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(upiId);
      showToast('UPI ID copied to clipboard!', 'success');
    }
  };

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
            {paymentInfo?.mode === 'demo' && method !== 'cash' && <div className="form-hint mb-4">Demo payment only — no real transaction is processed.</div>}
            {error && <div className="form-error mb-4">{error}</div>}

            {method === 'upi' && (
              <div className="flex flex-col items-center gap-4 p-6 bg-ink-900 border border-ink-700 rounded-xl" data-testid="upi-panel">
                <div className="w-52 h-52 bg-white rounded-xl overflow-hidden p-2 flex items-center justify-center shadow-lg">
                  <img
                    src={qrUrl}
                    alt="UPI Scanner QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-center">
                  <div className="font-bold text-white text-base">Scan to pay ₹{booking.totalAmount}</div>
                  <div className="flex items-center justify-center gap-2 text-xs bg-ink-800 px-3 py-1.5 rounded-lg border border-ink-700 mt-2">
                    <span className="text-muted-faint font-mono">UPI ID: <strong className="text-brand">{upiId}</strong></span>
                    <button
                      type="button"
                      onClick={copyUpiId}
                      className="text-brand hover:text-white transition-colors ml-1"
                      title="Copy UPI ID"
                    >
                      <i className="fa-regular fa-copy"></i>
                    </button>
                  </div>
                </div>
                <div className="flex gap-3 flex-wrap justify-center mt-1">
                  {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(a => (
                    <a
                      key={a}
                      href={upiUri}
                      className="flex flex-col items-center gap-1.5 p-3 min-w-[72px] bg-ink-800 border border-ink-700 rounded-lg text-xs text-muted-faint hover:border-brand hover:text-brand transition-colors cursor-pointer"
                    >
                      <i className="fa-solid fa-mobile-screen text-xl text-brand"></i>{a}
                    </a>
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
              <div className="p-6 bg-ink-900 border border-ink-700 rounded-xl" data-testid="nb-panel">
                <h3 className="font-bold mb-4 text-white">Direct Bank Transfer</h3>
                <p className="text-sm text-muted-faint mb-6">{paymentInfo?.bankConfigured ? <>Please transfer <span className="font-bold text-white">₹{booking.totalAmount}</span> to the following bank account to confirm your booking.</> : 'Bank transfer details are not configured. Please choose cash on pickup or contact support.'}</p>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-ink-800 pb-2">
                    <span className="text-muted-faint">Bank Name</span>
                    <span className="font-bold text-white">{bank?.name || 'Not configured'}</span>
                  </div>
                  <div className="flex justify-between border-b border-ink-800 pb-2">
                    <span className="text-muted-faint">Account Name</span>
                    <span className="font-bold text-white">{bank?.accountName || 'Not configured'}</span>
                  </div>
                  <div className="flex justify-between border-b border-ink-800 pb-2">
                    <span className="text-muted-faint">Account Number</span>
                    <span className="font-bold text-brand">{bank?.accountNumber || 'Not configured'}</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-muted-faint">IFSC Code</span>
                    <span className="font-bold text-white">{bank?.ifsc || 'Not configured'}</span>
                  </div>
                </div>
              </div>
            )}

            {method === 'cash' && <div className="form-hint" data-testid="cash-panel">Pay ₹{booking.totalAmount} at pickup. Your booking will be confirmed, but payment remains due at pickup.</div>}

            <button className="btn-primary btn-block btn-lg mt-6" onClick={pay} disabled={loading} data-testid="pay-now-btn">
              {loading ? 'Processing…' : method === 'cash' ? 'Confirm cash on pickup' : paymentInfo?.mode === 'demo' ? `Confirm demo payment · ₹${booking.totalAmount}` : `Pay ₹${booking.totalAmount}`}
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
