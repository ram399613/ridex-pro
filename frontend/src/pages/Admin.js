import React, { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const emptyVehicle = {
  name: '', brand: '', type: 'bike', pricePerDay: 500, color: '',
  description: '', images: [''],
  specs: { engine: '', mileage: '', transmission: 'Manual', fuelType: 'Petrol', seats: 2, power: '' },
};

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
        api.get('/admin/stats'),
        api.get('/admin/bookings'),
        api.get('/admin/vehicles'),
        api.get('/admin/users'),
        api.get('/contact'),
      ]);
      setStats(s.data); setBookings(b.data); setVehicles(v.data); setUsers(u.data); setContactMsgs(c.data);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    load();
    const refresh = () => load();
    window.addEventListener('ridex:admin-refresh', refresh);
    window.addEventListener('ridex:admin-booking', refresh);
    window.addEventListener('ridex:admin-contact', refresh);
    window.addEventListener('ridex:vehicle-updated', refresh);
    return () => {
      window.removeEventListener('ridex:admin-refresh', refresh);
      window.removeEventListener('ridex:admin-booking', refresh);
      window.removeEventListener('ridex:admin-contact', refresh);
      window.removeEventListener('ridex:vehicle-updated', refresh);
    };
  }, [load]);

  const updateBooking = async (id, status) => {
    try { await api.put(`/admin/bookings/${id}`, { status }); showToast(`Booking marked ${status}`, 'success'); load(); }
    catch (err) { showToast('Failed', 'error'); }
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

  return (
    <div className="sidebar-layout" data-testid="admin-page">
      <aside className="sidebar">
        <div className="sidebar-logo">Ride<span>X</span> · Admin</div>
        <div className="sidebar-label">Manage</div>
        <button className={`sidebar-link ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')} data-testid="admin-tab-overview"><span className="icon"><i className="fa-solid fa-gauge"></i></span> Overview</button>
        <button className={`sidebar-link ${tab === 'bookings' ? 'active' : ''}`} onClick={() => setTab('bookings')} data-testid="admin-tab-bookings"><span className="icon"><i className="fa-solid fa-calendar-check"></i></span> Bookings</button>
        <button className={`sidebar-link ${tab === 'vehicles' ? 'active' : ''}`} onClick={() => setTab('vehicles')} data-testid="admin-tab-vehicles"><span className="icon"><i className="fa-solid fa-car"></i></span> Vehicles</button>
        <button className={`sidebar-link ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')} data-testid="admin-tab-users"><span className="icon"><i className="fa-solid fa-users"></i></span> Users</button>
        <button className={`sidebar-link ${tab === 'messages' ? 'active' : ''}`} onClick={() => setTab('messages')} data-testid="admin-tab-messages"><span className="icon"><i className="fa-solid fa-envelope"></i></span> Messages</button>
      </aside>

      <div className="main-content">
        {tab === 'overview' && stats && (
          <>
            <h2 style={{ marginBottom: 8 }}>Admin <span style={{ color: 'var(--orange)' }}>Dashboard</span></h2>
            <p style={{ marginBottom: 24 }}>Live stats, updated in real-time.</p>
            <div className="stats-grid" style={{ marginBottom: 32 }}>
              <div className="stat-card"><div className="stat-icon orange"><i className="fa-solid fa-users"></i></div><div><div className="stat-value" data-testid="stat-users">{stats.totalUsers}</div><div className="stat-label">Users</div></div></div>
              <div className="stat-card"><div className="stat-icon blue"><i className="fa-solid fa-car"></i></div><div><div className="stat-value" data-testid="stat-vehicles">{stats.totalVehicles}</div><div className="stat-label">Vehicles</div></div></div>
              <div className="stat-card"><div className="stat-icon green"><i className="fa-solid fa-calendar-check"></i></div><div><div className="stat-value" data-testid="stat-bookings">{stats.totalBookings}</div><div className="stat-label">Bookings</div></div></div>
              <div className="stat-card"><div className="stat-icon purple"><i className="fa-solid fa-rupee-sign"></i></div><div><div className="stat-value" data-testid="stat-revenue">₹{stats.totalRevenue}</div><div className="stat-label">Revenue</div></div></div>
            </div>

            <h3 style={{ marginBottom: 16 }}>Recent bookings</h3>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Booking</th><th>User</th><th>Vehicle</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>
                  {stats.recentBookings.map(b => (
                    <tr key={b._id}>
                      <td style={{ fontFamily: 'monospace' }}>{b.bookingId}</td>
                      <td>{b.user?.name}</td>
                      <td style={{ color: 'var(--text-primary)' }}>{b.vehicle?.name}</td>
                      <td>₹{b.totalAmount}</td>
                      <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'bookings' && (
          <>
            <h2 style={{ marginBottom: 24 }}>All bookings</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Booking</th><th>User</th><th>Vehicle</th><th>Dates</th><th>Amount</th><th>Status</th><th>Payment</th><th>Actions</th></tr></thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b._id} data-testid={`admin-booking-${b._id}`}>
                      <td style={{ fontFamily: 'monospace' }}>{b.bookingId}</td>
                      <td>{b.user?.name}<div style={{ fontSize: '0.72rem' }}>{b.user?.email}</div></td>
                      <td style={{ color: 'var(--text-primary)' }}>{b.vehicle?.name}</td>
                      <td>{new Date(b.pickupDate).toLocaleDateString()} → {new Date(b.returnDate).toLocaleDateString()}</td>
                      <td>₹{b.totalAmount}</td>
                      <td>
                        <select value={b.status} onChange={(e) => updateBooking(b._id, e.target.value)} className="form-control" style={{ padding: 6, fontSize: '0.8rem' }} data-testid={`booking-status-${b._id}`}>
                          <option value="pending">pending</option>
                          <option value="confirmed">confirmed</option>
                          <option value="completed">completed</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                      </td>
                      <td><span className={`badge badge-${b.paymentStatus}`}>{b.paymentStatus}</span></td>
                      <td>—</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'vehicles' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2>Manage vehicles</h2>
              <button className="btn btn-primary" onClick={() => setEditVehicle({ ...emptyVehicle })} data-testid="add-vehicle-btn"><i className="fa-solid fa-plus"></i> Add Vehicle</button>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>Brand</th><th>Type</th><th>Price/day</th><th>Available</th><th>Actions</th></tr></thead>
                <tbody>
                  {vehicles.map(v => (
                    <tr key={v._id}>
                      <td style={{ color: 'var(--text-primary)' }}>{v.name}</td>
                      <td>{v.brand}</td>
                      <td>{v.type}</td>
                      <td>₹{v.pricePerDay}</td>
                      <td><span className={`badge badge-${v.available ? 'confirmed' : 'cancelled'}`}>{v.available ? 'Yes' : 'No'}</span></td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditVehicle({ ...v, images: v.images?.length ? v.images : [''] })} data-testid={`edit-vehicle-${v._id}`}><i className="fa-solid fa-pen"></i></button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteVehicle(v._id)} style={{ marginLeft: 6 }} data-testid={`delete-vehicle-${v._id}`}><i className="fa-solid fa-trash"></i></button>
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
            <h2 style={{ marginBottom: 24 }}>Users</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Actions</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td style={{ color: 'var(--text-primary)' }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.phone || '—'}</td>
                      <td><span className={`badge badge-${u.role === 'admin' ? 'completed' : 'confirmed'}`}>{u.role}</span></td>
                      <td>{u.role !== 'admin' && <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u._id)}><i className="fa-solid fa-trash"></i></button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'messages' && (
          <>
            <h2 style={{ marginBottom: 24 }}>Contact messages</h2>
            {contactMsgs.length === 0 ? <div className="empty-state"><i className="fa-solid fa-envelope-open"></i>No messages yet.</div> :
              <div style={{ display: 'grid', gap: 12 }}>
                {contactMsgs.map(m => (
                  <div key={m.id} className="card card-body" data-testid={`msg-${m.id}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{m.name} · {m.email}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(m.createdAt).toLocaleString()}</span>
                    </div>
                    <div style={{ color: 'var(--orange)', marginBottom: 6, fontSize: '0.85rem' }}>{m.subject}</div>
                    <p>{m.message}</p>
                  </div>
                ))}
              </div>
            }
          </>
        )}
      </div>

      {editVehicle && (
        <div className="modal-overlay">
          <div className="modal" data-testid="vehicle-modal">
            <div className="modal-header">
              <h3>{editVehicle._id ? 'Edit Vehicle' : 'Add Vehicle'}</h3>
              <button className="modal-close" onClick={() => setEditVehicle(null)}>×</button>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Name</label><input className="form-control" value={editVehicle.name} onChange={(e) => setEditVehicle({ ...editVehicle, name: e.target.value })} data-testid="vf-name" /></div>
              <div className="form-group"><label className="form-label">Brand</label><input className="form-control" value={editVehicle.brand} onChange={(e) => setEditVehicle({ ...editVehicle, brand: e.target.value })} data-testid="vf-brand" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Type</label>
                <select className="form-control" value={editVehicle.type} onChange={(e) => setEditVehicle({ ...editVehicle, type: e.target.value })} data-testid="vf-type">
                  <option value="bike">Bike</option><option value="scooter">Scooter</option><option value="car">Car</option><option value="luxury">Luxury</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Price / day</label><input type="number" className="form-control" value={editVehicle.pricePerDay} onChange={(e) => setEditVehicle({ ...editVehicle, pricePerDay: e.target.value })} data-testid="vf-price" /></div>
            </div>
            <div className="form-group"><label className="form-label">Image URL</label><input className="form-control" value={editVehicle.images?.[0] || ''} onChange={(e) => setEditVehicle({ ...editVehicle, images: [e.target.value] })} data-testid="vf-image" /></div>
            <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" rows="3" value={editVehicle.description} onChange={(e) => setEditVehicle({ ...editVehicle, description: e.target.value })} data-testid="vf-desc" /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Engine</label><input className="form-control" value={editVehicle.specs.engine} onChange={(e) => setEditVehicle({ ...editVehicle, specs: { ...editVehicle.specs, engine: e.target.value } })} /></div>
              <div className="form-group"><label className="form-label">Mileage</label><input className="form-control" value={editVehicle.specs.mileage} onChange={(e) => setEditVehicle({ ...editVehicle, specs: { ...editVehicle.specs, mileage: e.target.value } })} /></div>
            </div>
            <button className="btn btn-primary btn-block" onClick={saveVehicle} data-testid="vf-save">Save</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
