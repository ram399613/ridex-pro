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
    <section className="pt-32 pb-16 max-w-xl mx-auto px-6" data-testid="register-page">
      <div className="card-flat p-8">
        <h2 className="text-3xl font-extrabold mb-2">Create your <span className="text-brand">RideX</span> account</h2>
        <p className="text-muted mb-6">Join thousands of riders.</p>
        <form onSubmit={submit}>
          <div className="mb-5">
            <label className="form-label">Full name</label>
            <input className="form-control" value={form.name} onChange={upd('name')} required data-testid="register-name" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="form-label">Email</label>
              <input className="form-control" type="email" value={form.email} onChange={upd('email')} required data-testid="register-email" />
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input className="form-control" value={form.phone} onChange={upd('phone')} data-testid="register-phone" />
            </div>
          </div>
          <div className="mb-5">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" value={form.password} onChange={upd('password')} required minLength={6} data-testid="register-password" />
            <div className="form-hint">Minimum 6 characters</div>
          </div>
          {error && <div className="form-error mb-3" data-testid="register-error">{error}</div>}
          <button className="btn-primary btn-block btn-lg" disabled={loading} data-testid="register-submit">
            {loading ? 'Creating…' : 'Create Account'}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-muted">
          Already have an account? <Link to="/login" className="text-brand font-medium" data-testid="link-login">Login</Link>
        </p>
      </div>
    </section>
  );
};

export default Register;
