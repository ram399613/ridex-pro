import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const u = await login(email, password);
      showToast(`Welcome back, ${u.name.split(' ')[0]}!`, 'success');
      navigate(location.state?.from || (u.role === 'admin' ? '/admin' : '/dashboard'));
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <section className="section container" style={{ paddingTop: 120, maxWidth: 480 }} data-testid="login-page">
      <div className="card card-body" style={{ padding: 32 }}>
        <h2 style={{ marginBottom: 8 }}>Welcome <span style={{ color: 'var(--orange)' }}>back</span></h2>
        <p style={{ marginBottom: 24 }}>Login to book your next ride.</p>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required data-testid="login-email" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required data-testid="login-password" />
          </div>
          {error && <div className="form-error" data-testid="login-error">{error}</div>}
          <button className="btn btn-primary btn-block btn-lg" disabled={loading} data-testid="login-submit">
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>
        <p style={{ marginTop: 20, textAlign: 'center', fontSize: '0.875rem' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--orange)' }} data-testid="link-register">Sign up</Link>
        </p>
        <div style={{ marginTop: 20, padding: 12, background: 'var(--bg-secondary)', borderRadius: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <div>Demo Admin: admin@ridex.com / admin123</div>
          <div>Demo User: ramu@example.com / test123</div>
        </div>
      </div>
    </section>
  );
};

export default Login;
