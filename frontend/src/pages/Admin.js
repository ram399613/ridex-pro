import React, { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const emptyVehicle = {
  name: '', brand: '', type: 'bike', pricePerDay: 500, color: '',
  description: '', images: [''],
  specs: { engine: '', mileage: '', transmission: 'Manual', fuelType: 'Petrol', seats: 2, power: '' },
};

const StatCard = ({ icon, color, value, label, testid }) => (
  <div className="bg-ink-800 border border-ink-700 rounded-xl p-5 flex items-center gap-4 hover:border-brand transition-colors">
    <div className={`w-13 h-13 rounded-lg flex items-center justify-center text-2xl ${color}`}><i className={`fa-solid ${icon}`}></i></div>
    <div>
      <div className="text-2xl font-extrabold leading-none mb-1" data-testid={testid}>{value}</div>
      <div className="text-xs text-muted-faint">{label}</div>
    </div>
  </div>
);

const Admin = () => {
  const { showToast } = useToast();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [contactMsgs, setContactMsgs] = useState([]);
  const [editVehicle, setEditVehicle] = useState(null);

  const load = useCallback(async () => {
    try {
      const [s, b, v, u, c] = await Promise.all([
        api.get('/admin/stats'), api.get('/admin/bookings'),
        api.get('/admin/vehicles'), api.get('/admin/users'), api.get('/contact'),
      ]);
      setStats(s.data); setBookings(b.data); setVehicles(v.data); setUsers(u.data); setContactMsgs(c.data);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    load();
    const refresh = () => load();
    ['ridex:admin-refresh','ridex:admin-booking','ridex:admin-contact','ridex:vehicle-updated'].forEach(ev => window.addEventListener(ev, refresh));
    return () => ['ridex:admin-refresh','ridex:admin-booking','ridex:admin-contact','ridex:vehicle-updated'].forEach(ev => window.removeEventListener(ev, refresh));
  }, [load]);

  const updateBooking = async (id, status) => {
    try { await api.put(`/admin/bookings/${id}`, { status }); showToast(`Booking marked ${status}`, 'success'); load(); }
    catch { showToast('Failed', 'error'); }
  };
  const deleteVehicle = async (id) => {
    if (!window.confirm('Delete this vehicle?')) return;
    try { await api.delete(`/vehicles/${id}`); showToast('Vehicle deleted', 'info'); load(); }
    catch { showToast('Failed', 'error'); }
  };
  const saveVehicle = async () => {
    try {
      const payload = { ...editVehicle, pricePerDay: Number(editVehicle.pricePerDay), images: editVehicle.images.filter(Boolean) };
      if (editVehicle._id) await api.put(`/vehicles/${editVehicle._id}`, payload);
      else await api.post('/vehicles', payload);
      showToast('Saved', 'success'); setEditVehicle(null); load();
    } catch (err) { showToast(err.response?.data?.message || 'Failed', 'error'); }
  };
  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try { await api.delete(`/admin/users/${id}`); showToast('User deleted', 'info'); load(); }
    catch { showToast('Failed', 'error'); }
  };

  const sidebarBtn = (active) => `w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-brand/10 text-brand border border-brand/20' : 'text-muted hover:bg-ink-800 hover:text-white'}`;

  return (
    <div className="flex min-h-screen pt-16" data-testid="admin-page">
      <aside className="hidden md:block w-60 fixed top-16 bottom-0 bg-ink-900/90 border-r border-ink-700 p-4 overflow-y-auto">
        <div className="text-lg font-extrabold pb-5 border-b border-ink-700 mb-5">Ride<span className="text-brand">X</span> · Admin</div>
        <div className="text-[10px] font-semibold text-muted-faint uppercase tracking-wider px-2 mb-1">Manage</div>
        {[
          ['overview', 'fa-gauge', 'Overview', 'admin-tab-overview'],
          ['bookings', 'fa-calendar-check', 'Bookings', 'admin-tab-bookings'],
          ['vehicles', 'fa-car', 'Vehicles', 'admin-tab-vehicles'],
          ['users', 'fa-users', 'Users', 'admin-tab-users'],
          ['messages', 'fa-envelope', 'Messages', 'admin-tab-messages'],
        ].map(([t, icon, label, tid]) => (
          <button key={t} className={sidebarBtn(tab === t)} onClick={() => setTab(t)} data-testid={tid}>
            <i className={`fa-solid ${icon} w-5 text-center`}></i> {label}
          </button>
        ))}
      </aside>

      <div className="flex-1 md:ml-60 p-6 lg:p-8">
        {tab === 'overview' && stats && (
          <>
            <h2 className="text-3xl font-extrabold mb-2">Admin <span className="text-brand">Dashboard</span></h2>
            <p className="text-muted mb-6">Live stats, updated in real-time.</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <StatCard icon="fa-users" color="bg-brand/15 text-brand" value={stats.totalUsers} label="Users" testid="stat-users" />
              <StatCard icon="fa-car" color="bg-blue-500/15 text-blue-400" value={stats.totalVehicles} label="Vehicles" testid="stat-vehicles" />
              <StatCard icon="fa-calendar-check" color="bg-green-500/15 text-green-400" value={stats.totalBookings} label="Bookings" testid="stat-bookings" />
              <StatCard icon="fa-rupee-sign" color="bg-violet-500/15 text-violet-400" value={`₹${stats.totalRevenue}`} label="Revenue" testid="stat-revenue" />
            </div>

            <h3 className="text-xl font-bold mb-4">Recent bookings</h3>
            <div className="overflow-x-auto rounded-xl border border-ink-700 bg-ink-800">
              <table className="w-full text-sm">
                <thead className="bg-ink-900"><tr>{['Booking','User','Vehicle','Amount','Status'].map(h => <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-muted-faint uppercase tracking-wide">{h}</th>)}</tr></thead>
                <tbody>
                  {stats.recentBookings.map(b => (
                    <tr key={b._id} className="border-t border-ink-700 hover:bg-ink-750">
                      <td className="px-4 py-3.5 font-mono">{b.bookingId}</td>
                      <td className="px-4 py-3.5 text-muted">{b.user?.name}</td>
                      <td className="px-4 py-3.5 text-white">{b.vehicle?.name}</td>
                      <td className="px-4 py-3.5">₹{b.totalAmount}</td>
                      <td className="px-4 py-3.5"><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'bookings' && (
          <>
            <h2 className="text-3xl font-extrabold mb-6">All bookings</h2>
            <div className="overflow-x-auto rounded-xl border border-ink-700 bg-ink-800">
              <table className="w-full text-sm">
                <thead className="bg-ink-900"><tr>{['Booking','User','Vehicle','Dates','Amount','Status','Payment'].map(h => <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-muted-faint uppercase tracking-wide">{h}</th>)}</tr></thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b._id} className="border-t border-ink-700 hover:bg-ink-750" data-testid={`admin-booking-${b._id}`}>
                      <td className="px-4 py-3.5 font-mono">{b.bookingId}</td>
                      <td className="px-4 py-3.5 text-muted">{b.user?.name}<div className="text-[11px] text-muted-faint">{b.user?.email}</div></td>
                      <td className="px-4 py-3.5 text-white">{b.vehicle?.name}</td>
                      <td className="px-4 py-3.5 text-muted whitespace-nowrap">{new Date(b.pickupDate).toLocaleDateString()} → {new Date(b.returnDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3.5">₹{b.totalAmount}</td>
                      <td className="px-4 py-3.5">
                        <select value={b.status} onChange={(e) => updateBooking(b._id, e.target.value)} className="form-control py-1.5 text-xs" data-testid={`booking-status-${b._id}`}>
                          <option value="pending">pending</option>
                          <option value="confirmed">confirmed</option>
                          <option value="completed">completed</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                      </td>
                      <td className="px-4 py-3.5"><span className={`badge badge-${b.paymentStatus}`}>{b.paymentStatus}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'vehicles' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-extrabold">Manage vehicles</h2>
              <button className="btn-primary" onClick={() => setEditVehicle({ ...emptyVehicle })} data-testid="add-vehicle-btn"><i className="fa-solid fa-plus"></i> Add Vehicle</button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-ink-700 bg-ink-800">
              <table className="w-full text-sm">
                <thead className="bg-ink-900"><tr>{['Name','Brand','Type','Price/day','Available','Actions'].map(h => <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-muted-faint uppercase tracking-wide">{h}</th>)}</tr></thead>
                <tbody>
                  {vehicles.map(v => (
                    <tr key={v._id} className="border-t border-ink-700 hover:bg-ink-750">
                      <td className="px-4 py-3.5 text-white">{v.name}</td>
                      <td className="px-4 py-3.5 text-muted">{v.brand}</td>
                      <td className="px-4 py-3.5 text-muted capitalize">{v.type}</td>
                      <td className="px-4 py-3.5">₹{v.pricePerDay}</td>
                      <td className="px-4 py-3.5"><span className={`badge badge-${v.available ? 'confirmed' : 'cancelled'}`}>{v.available ? 'Yes' : 'No'}</span></td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <button className="btn-ghost btn-sm" onClick={() => setEditVehicle({ ...v, images: v.images?.length ? v.images : [''] })} data-testid={`edit-vehicle-${v._id}`}><i className="fa-solid fa-pen"></i></button>
                        <button className="btn-danger btn-sm ml-1.5" onClick={() => deleteVehicle(v._id)} data-testid={`delete-vehicle-${v._id}`}><i className="fa-solid fa-trash"></i></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'users' && (
          <>
            <h2 className="text-3xl font-extrabold mb-6">Users</h2>
            <div className="overflow-x-auto rounded-xl border border-ink-700 bg-ink-800">
              <table className="w-full text-sm">
                <thead className="bg-ink-900"><tr>{['Name','Email','Phone','Role','Actions'].map(h => <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-muted-faint uppercase tracking-wide">{h}</th>)}</tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} className="border-t border-ink-700 hover:bg-ink-750">
                      <td className="px-4 py-3.5 text-white">{u.name}</td>
                      <td className="px-4 py-3.5 text-muted">{u.email}</td>
                      <td className="px-4 py-3.5 text-muted">{u.phone || '—'}</td>
                      <td className="px-4 py-3.5"><span className={`badge badge-${u.role === 'admin' ? 'completed' : 'confirmed'}`}>{u.role}</span></td>
                      <td className="px-4 py-3.5">{u.role !== 'admin' && <button className="btn-danger btn-sm" onClick={() => deleteUser(u._id)}><i className="fa-solid fa-trash"></i></button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'messages' && (
          <>
            <h2 className="text-3xl font-extrabold mb-6">Contact messages</h2>
            {contactMsgs.length === 0 ? <div className="text-center py-16 text-muted-faint"><i className="fa-solid fa-envelope-open text-5xl block mb-4"></i>No messages yet.</div> :
              <div className="grid gap-3">
                {contactMsgs.map(m => (
                  <div key={m.id} className="card-flat p-6" data-testid={`msg-${m.id}`}>
                    <div className="flex justify-between mb-2">
                      <strong className="text-white">{m.name} · {m.email}</strong>
                      <span className="text-xs text-muted-faint">{new Date(m.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="text-brand mb-1.5 text-sm font-semibold">{m.subject}</div>
                    <p className="text-muted">{m.message}</p>
                  </div>
                ))}
              </div>
            }
          </>
        )}
      </div>

      {editVehicle && (
        <div className="fixed inset-0 z-[9000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-ink-800 border border-ink-700 rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto" data-testid="vehicle-modal">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editVehicle._id ? 'Edit Vehicle' : 'Add Vehicle'}</h3>
              <button onClick={() => setEditVehicle(null)} className="w-8 h-8 rounded-full bg-ink-900 text-muted-faint hover:text-white transition-colors">×</button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><label className="form-label">Name</label><input className="form-control" value={editVehicle.name} onChange={(e) => setEditVehicle({ ...editVehicle, name: e.target.value })} data-testid="vf-name" /></div>
              <div><label className="form-label">Brand</label><input className="form-control" value={editVehicle.brand} onChange={(e) => setEditVehicle({ ...editVehicle, brand: e.target.value })} data-testid="vf-brand" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><label className="form-label">Type</label>
                <select className="form-control" value={editVehicle.type} onChange={(e) => setEditVehicle({ ...editVehicle, type: e.target.value })} data-testid="vf-type">
                  <option value="bike">Bike</option><option value="scooter">Scooter</option><option value="car">Car</option><option value="luxury">Luxury</option>
                </select>
              </div>
              <div><label className="form-label">Price / day</label><input type="number" className="form-control" value={editVehicle.pricePerDay} onChange={(e) => setEditVehicle({ ...editVehicle, pricePerDay: e.target.value })} data-testid="vf-price" /></div>
            </div>
            <div className="mb-4"><label className="form-label">Image URL</label><input className="form-control" value={editVehicle.images?.[0] || ''} onChange={(e) => setEditVehicle({ ...editVehicle, images: [e.target.value] })} data-testid="vf-image" /></div>
            <div className="mb-4"><label className="form-label">Description</label><textarea className="form-control" rows="3" value={editVehicle.description} onChange={(e) => setEditVehicle({ ...editVehicle, description: e.target.value })} data-testid="vf-desc" /></div>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div><label className="form-label">Engine</label><input className="form-control" value={editVehicle.specs.engine} onChange={(e) => setEditVehicle({ ...editVehicle, specs: { ...editVehicle.specs, engine: e.target.value } })} /></div>
              <div><label className="form-label">Mileage</label><input className="form-control" value={editVehicle.specs.mileage} onChange={(e) => setEditVehicle({ ...editVehicle, specs: { ...editVehicle.specs, mileage: e.target.value } })} /></div>
            </div>
            <button className="btn-primary btn-block" onClick={saveVehicle} data-testid="vf-save">Save</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
