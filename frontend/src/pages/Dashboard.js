import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Dashboard = () => {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState('overview');
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });

  useEffect(() => { api.get('/bookings').then(({ data }) => setBookings(data)); }, []);
  useEffect(() => {
    const onNotif = () => api.get('/bookings').then(({ data }) => setBookings(data));
    window.addEventListener('ridex:notification', onNotif);
    return () => window.removeEventListener('ridex:notification', onNotif);
  }, []);

  const stats = useMemo(() => ({
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    spent: bookings.filter(b => b.paymentStatus === 'paid').reduce((s, b) => s + b.totalAmount, 0),
  }), [bookings]);

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/auth/profile', form);
      const { token, ...u } = data;
      localStorage.setItem('ridex_user', JSON.stringify(u));
      if (token) localStorage.setItem('ridex_token', token);
      setUser(u);
      showToast('Profile updated!', 'success');
    } catch (err) { showToast(err.response?.data?.message || 'Failed', 'error'); }
  };

  return (
    <div className="sidebar-layout" data-testid="dashboard-page">
      <aside className="sidebar">
        <div className="sidebar-logo">Ride<span>X</span></div>
        <div className="sidebar-label">Account</div>
        <button className={`sidebar-link ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')} data-testid="tab-overview"><span className="icon"><i className="fa-solid fa-gauge"></i></span> Overview</button>
        <Link to="/my-bookings" className="sidebar-link"><span className="icon"><i className="fa-solid fa-calendar-check"></i></span> My Bookings</Link>
        <button className={`sidebar-link ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')} data-testid="tab-profile"><span className="icon"><i className="fa-solid fa-user"></i></span> Profile</button>
        <Link to="/vehicles" className="sidebar-link"><span className="icon"><i className="fa-solid fa-motorcycle"></i></span> Browse Vehicles</Link>
      </aside>

      <div className="main-content">
        {tab === 'overview' && (
          <>
            <h2 style={{ marginBottom: 8 }}>Welcome, <span style={{ color: 'var(--orange)' }}>{user?.name?.split(' ')[0]}</span></h2>
            <p style={{ marginBottom: 24 }}>Here's your activity at a glance.</p>
            <div className="stats-grid" style={{ marginBottom: 32 }}>
              <div className="stat-card"><div className="stat-icon orange"><i className="fa-solid fa-calendar-check"></i></div><div><div className="stat-value" data-testid="stat-total">{stats.total}</div><div className="stat-label">Total Bookings</div></div></div>
              <div className="stat-card"><div className="stat-icon green"><i className="fa-solid fa-circle-check"></i></div><div><div className="stat-value">{stats.confirmed}</div><div className="stat-label">Confirmed</div></div></div>
              <div className="stat-card"><div className="stat-icon blue"><i className="fa-solid fa-hourglass-half"></i></div><div><div className="stat-value">{stats.pending}</div><div className="stat-label">Pending</div></div></div>
              <div className="stat-card"><div className="stat-icon purple"><i className="fa-solid fa-rupee-sign"></i></div><div><div className="stat-value">₹{stats.spent}</div><div className="stat-label">Total Spent</div></div></div>
            </div>

            <h3 style={{ marginBottom: 16 }}>Recent bookings</h3>
            {bookings.length === 0 ? (
              <div className="empty-state"><i className="fa-solid fa-inbox"></i>No bookings yet. <Link to="/vehicles" style={{ color: 'var(--orange)' }}>Book your first ride</Link></div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Booking</th><th>Vehicle</th><th>Dates</th><th>Amount</th><th>Status</th></tr></thead>
                  <tbody>
                    {bookings.slice(0, 5).map(b => (
                      <tr key={b._id}>
                        <td style={{ fontFamily: 'monospace' }}>{b.bookingId}</td>
                        <td style={{ color: 'var(--text-primary)' }}>{b.vehicle?.name}</td>
                        <td>{new Date(b.pickupDate).toLocaleDateString()}</td>
                        <td>₹{b.totalAmount}</td>
                        <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {tab === 'profile' && (
          <>
            <h2 style={{ marginBottom: 24 }}>Profile settings</h2>
            <form className="card card-body" onSubmit={saveProfile} style={{ padding: 32, maxWidth: 640 }}>
              <div className="form-group">
                <label className="form-label">Full name</label>
                <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="profile-name" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-control" value={user?.email || ''} disabled />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-control" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} data-testid="profile-phone" />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea className="form-control" rows="3" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} data-testid="profile-address" />
              </div>
              <button className="btn btn-primary" data-testid="profile-save">Save changes</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
