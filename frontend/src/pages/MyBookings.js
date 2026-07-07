import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const StatusBadge = ({ status }) => <span className={`badge badge-${status}`}>{status}</span>;
const PayBadge = ({ status }) => <span className={`badge badge-${status}`}>{status}</span>;

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
      <header className="page-header">
        <div className="container">
          <div className="breadcrumb"><Link to="/">Home</Link> / <span>My Bookings</span></div>
          <h1>My <span style={{ color: 'var(--orange)' }}>Bookings</span></h1>
        </div>
      </header>
      <section className="section container" data-testid="my-bookings-page">
        {loading ? <div className="spinner"></div> :
          bookings.length === 0 ? (
            <div className="empty-state"><i className="fa-solid fa-calendar-xmark"></i>No bookings yet. <Link to="/vehicles" style={{ color: 'var(--orange)' }}>Browse rides</Link></div>
          ) : (
            <div className="table-wrap" data-testid="bookings-table">
              <table>
                <thead><tr><th>Booking</th><th>Vehicle</th><th>Dates</th><th>Amount</th><th>Status</th><th>Payment</th><th></th></tr></thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b._id} data-testid={`booking-row-${b._id}`}>
                      <td style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{b.bookingId}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          {b.vehicle?.images?.[0] && <img src={b.vehicle.images[0]} alt="" style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover' }} onError={(e) => (e.currentTarget.style.display = 'none')} />}
                          <div><div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{b.vehicle?.name}</div><div style={{ fontSize: '0.75rem' }}>{b.vehicle?.brand}</div></div>
                        </div>
                      </td>
                      <td>{new Date(b.pickupDate).toLocaleDateString()} → {new Date(b.returnDate).toLocaleDateString()}<div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{b.totalDays} days</div></td>
                      <td style={{ color: 'var(--orange)', fontWeight: 700 }}>₹{b.totalAmount}</td>
                      <td><StatusBadge status={b.status} /></td>
                      <td><PayBadge status={b.paymentStatus} /></td>
                      <td>
                        {b.paymentStatus === 'pending' && b.status !== 'cancelled' && <Link to={`/payment/${b._id}`} className="btn btn-primary btn-sm" data-testid={`pay-btn-${b._id}`}>Pay</Link>}
                        {['pending', 'confirmed'].includes(b.status) && <button className="btn btn-ghost btn-sm" onClick={() => cancel(b._id)} style={{ marginLeft: 6 }} data-testid={`cancel-btn-${b._id}`}>Cancel</button>}
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
