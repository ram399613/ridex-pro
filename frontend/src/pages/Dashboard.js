import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const StatCard = ({ icon, color, value, label, testid }) => (
  <div className="bg-ink-800 border border-ink-700 rounded-xl p-5 flex items-center gap-4 transition-all hover:border-brand">
    <div className={`w-13 h-13 rounded-lg flex items-center justify-center text-2xl ${color}`}><i className={`fa-solid ${icon}`}></i></div>
    <div>
      <div className="text-2xl font-extrabold leading-none mb-1" data-testid={testid}>{value}</div>
      <div className="text-xs text-muted-faint">{label}</div>
    </div>
  </div>
);

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

  const sidebarBtn = (active) => `w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-brand/10 text-brand border border-brand/20' : 'text-muted hover:bg-ink-800 hover:text-white'}`;

  return (
    <div className="flex min-h-screen pt-16" data-testid="dashboard-page">
      <aside className="hidden md:block w-60 fixed top-16 bottom-0 bg-ink-900/90 border-r border-ink-700 p-4 overflow-y-auto">
        <div className="text-lg font-extrabold pb-5 border-b border-ink-700 mb-5">Ride<span className="text-brand">X</span></div>
        <div className="text-[10px] font-semibold text-muted-faint uppercase tracking-wider px-2 mb-1">Account</div>
        <button className={sidebarBtn(tab === 'overview')} onClick={() => setTab('overview')} data-testid="tab-overview"><i className="fa-solid fa-gauge w-5 text-center"></i> Overview</button>
        <Link to="/my-bookings" className={sidebarBtn(false)}><i className="fa-solid fa-calendar-check w-5 text-center"></i> My Bookings</Link>
        <button className={sidebarBtn(tab === 'profile')} onClick={() => setTab('profile')} data-testid="tab-profile"><i className="fa-solid fa-user w-5 text-center"></i> Profile</button>
        <Link to="/vehicles" className={sidebarBtn(false)}><i className="fa-solid fa-motorcycle w-5 text-center"></i> Browse Vehicles</Link>
      </aside>

      <div className="flex-1 md:ml-60 p-6 lg:p-8">
        {tab === 'overview' && (
          <>
            <h2 className="text-3xl font-extrabold mb-2">Welcome, <span className="text-brand">{user?.name?.split(' ')[0]}</span></h2>
            <p className="text-muted mb-6">Here's your activity at a glance.</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <StatCard icon="fa-calendar-check" color="bg-brand/15 text-brand" value={stats.total} label="Total Bookings" testid="stat-total" />
              <StatCard icon="fa-circle-check" color="bg-green-500/15 text-green-400" value={stats.confirmed} label="Confirmed" />
              <StatCard icon="fa-hourglass-half" color="bg-blue-500/15 text-blue-400" value={stats.pending} label="Pending" />
              <StatCard icon="fa-rupee-sign" color="bg-violet-500/15 text-violet-400" value={`₹${stats.spent}`} label="Total Spent" />
            </div>

            <h3 className="text-xl font-bold mb-4">Recent bookings</h3>
            {bookings.length === 0 ? (
              <div className="text-center py-16 text-muted-faint"><i className="fa-solid fa-inbox text-5xl block mb-4"></i>No bookings yet. <Link to="/vehicles" className="text-brand font-medium">Book your first ride</Link></div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-ink-700 bg-ink-800">
                <table className="w-full text-sm">
                  <thead className="bg-ink-900"><tr>{['Booking','Vehicle','Dates','Amount','Status'].map(h => <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-muted-faint uppercase tracking-wide">{h}</th>)}</tr></thead>
                  <tbody>
                    {bookings.slice(0, 5).map(b => (
                      <tr key={b._id} className="border-t border-ink-700 hover:bg-ink-750">
                        <td className="px-4 py-3.5 font-mono">{b.bookingId}</td>
                        <td className="px-4 py-3.5 text-white">{b.vehicle?.name}</td>
                        <td className="px-4 py-3.5 text-muted">{new Date(b.pickupDate).toLocaleDateString()}</td>
                        <td className="px-4 py-3.5">₹{b.totalAmount}</td>
                        <td className="px-4 py-3.5"><span className={`badge badge-${b.status}`}>{b.status}</span></td>
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
            <h2 className="text-3xl font-extrabold mb-6">Profile settings</h2>
            <form className="card-flat p-8 max-w-2xl" onSubmit={saveProfile}>
              <div className="mb-4"><label className="form-label">Full name</label><input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="profile-name" /></div>
              <div className="mb-4"><label className="form-label">Email</label><input className="form-control" value={user?.email || ''} disabled /></div>
              <div className="mb-4"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} data-testid="profile-phone" /></div>
              <div className="mb-5"><label className="form-label">Address</label><textarea className="form-control" rows="3" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} data-testid="profile-address" /></div>
              <button className="btn-primary" data-testid="profile-save">Save changes</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
