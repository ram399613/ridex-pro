import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/bookings');
      setBookings(data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    const onNotif = () => load();
    window.addEventListener('ridex:notification', onNotif);
    return () => window.removeEventListener('ridex:notification', onNotif);
  }, [load]);

  const cancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await api.put(`/bookings/${id}/cancel`);
      showToast('Booking cancelled', 'info');
      load();
    } catch (err) { showToast(err.response?.data?.message || 'Failed to cancel', 'error'); }
  };

  return (
    <>
      <header className="pt-28 pb-10 bg-ink-900/80 border-b border-ink-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2 text-xs text-muted-faint mb-3"><Link to="/" className="hover:text-brand">Home</Link> / <span className="text-white">My Bookings</span></div>
          <h1 className="text-4xl font-extrabold">My <span className="text-brand">Bookings</span></h1>
        </div>
      </header>
      <section className="py-16 max-w-7xl mx-auto px-6" data-testid="my-bookings-page">
        {loading ? <div className="spinner"></div> :
          bookings.length === 0 ? (
            <div className="text-center py-20 text-muted-faint">
              <i className="fa-solid fa-calendar-xmark text-5xl block mb-4"></i>
              No bookings yet. <Link to="/vehicles" className="text-brand font-medium">Browse rides</Link>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-ink-700 bg-ink-800" data-testid="bookings-table">
              <table className="w-full text-sm">
                <thead className="bg-ink-900">
                  <tr>
                    {['Booking', 'Vehicle', 'Dates', 'Amount', 'Status', 'Payment', ''].map(h => (
                      <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-muted-faint uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b._id} className="border-t border-ink-700 hover:bg-ink-750 transition-colors" data-testid={`booking-row-${b._id}`}>
                      <td className="px-4 py-3.5 font-mono text-white">{b.bookingId}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-2.5 items-center">
                          {b.vehicle?.images?.[0] && <img src={b.vehicle.images[0]} alt="" className="w-12 h-12 rounded object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />}
                          <div>
                            <div className="text-white font-semibold">{b.vehicle?.name}</div>
                            <div className="text-[11px] text-muted-faint">{b.vehicle?.brand}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-muted">
                        {new Date(b.pickupDate).toLocaleDateString()} → {new Date(b.returnDate).toLocaleDateString()}
                        <div className="text-[10px] text-muted-faint">{b.totalDays} days</div>
                      </td>
                      <td className="px-4 py-3.5 text-brand font-bold">₹{b.totalAmount}</td>
                      <td className="px-4 py-3.5"><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                      <td className="px-4 py-3.5"><span className={`badge badge-${b.paymentStatus}`}>{b.paymentStatus}</span></td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {b.paymentStatus === 'pending' && b.status !== 'cancelled' && <Link to={`/payment/${b._id}`} className="btn-primary btn-sm" data-testid={`pay-btn-${b._id}`}>Pay</Link>}
                        {['pending', 'confirmed'].includes(b.status) && <button className="btn-ghost btn-sm ml-1.5" onClick={() => cancel(b._id)} data-testid={`cancel-btn-${b._id}`}>Cancel</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </section>
    </>
  );
};

export default MyBookings;
