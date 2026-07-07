import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Register = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const upd = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError(''); setLoading(true);
    try {
      await register(form);
      showToast('Account created!', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <section className="section container" style={{ paddingTop: 120, maxWidth: 520 }} data-testid="register-page">
      <div className="card card-body" style={{ padding: 32 }}>
        <h2 style={{ marginBottom: 8 }}>Create your <span style={{ color: 'var(--orange)' }}>RideX</span> account</h2>
        <p style={{ marginBottom: 24 }}>Join thousands of riders.</p>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Full name</label>
            <input className="form-control" value={form.name} onChange={upd('name')} required data-testid="register-name" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" value={form.email} onChange={upd('email')} required data-testid="register-email" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-control" value={form.phone} onChange={upd('phone')} data-testid="register-phone" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" value={form.password} onChange={upd('password')} required minLength={6} data-testid="register-password" />
            <div className="form-hint">Minimum 6 characters</div>
          </div>
          {error && <div className="form-error" data-testid="register-error">{error}</div>}
          <button className="btn btn-primary btn-block btn-lg" disabled={loading} data-testid="register-submit">
            {loading ? 'Creating…' : 'Create Account'}
          </button>
        </form>
        <p style={{ marginTop: 20, textAlign: 'center', fontSize: '0.875rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--orange)' }} data-testid="link-login">Login</Link>
        </p>
      </div>
    </section>
  );
};

export default Register;
