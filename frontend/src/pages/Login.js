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
    <section className="pt-32 pb-16 max-w-md mx-auto px-6" data-testid="login-page">
      <div className="card-flat p-8">
        <h2 className="text-3xl font-extrabold mb-2">Welcome <span className="text-brand">back</span></h2>
        <p className="text-muted mb-6">Login to book your next ride.</p>
        <form onSubmit={submit}>
          <div className="mb-5">
            <label className="form-label">Email</label>
            <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required data-testid="login-email" />
          </div>
          <div className="mb-5">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required data-testid="login-password" />
          </div>
          {error && <div className="form-error mb-3" data-testid="login-error">{error}</div>}
          <button className="btn-primary btn-block btn-lg" disabled={loading} data-testid="login-submit">
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-muted">
          Don't have an account? <Link to="/register" className="text-brand font-medium" data-testid="link-register">Sign up</Link>
        </p>
        <div className="mt-5 p-3 bg-ink-900 rounded-lg text-xs text-muted-faint space-y-1">
          <div>Demo Admin: admin@ridex.com / admin123</div>
          <div>Demo User: ramu@example.com / test123</div>
        </div>
      </div>
    </section>
  );
};

export default Login;
