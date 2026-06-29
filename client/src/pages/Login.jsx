import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [role, setRole] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const demoCredentials = {
    user: { email: 'user@ucab.com', password: 'user123' },
    driver: { email: 'driver@ucab.com', password: 'driver123' },
    admin: { email: 'admin@ucab.com', password: 'admin123' },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) { setError('Email is required'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Invalid email format'); return; }
    if (!password.trim()) { setError('Password is required'); return; }

    setLoading(true);
    try {
      const data = await login(email, password);
      const userRole = data.data?.role || role;
      if (userRole === 'admin') navigate('/admin');
      else if (userRole === 'driver') navigate('/driver');
      else navigate('/dashboard');
    } catch (err) {
      const errMsg = err.response?.data?.error || 
                     (err.response?.data?.errors && err.response.data.errors[0]?.message) || 
                     err.response?.data?.message || 
                     'Login failed. Please try again.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    const creds = demoCredentials[role];
    setEmail(creds.email);
    setPassword(creds.password);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', paddingTop: '90px' }}>
      <div className="floating-shapes" style={{ position: 'fixed', inset: 0, zIndex: 0 }}></div>
      <div className="glass-card animate-slide-up" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 className="gradient-text" style={{ fontFamily: 'Outfit', marginBottom: '0.5rem' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Sign in to continue your journey</p>
        </div>

        <div className="auth-tabs">
          {['user', 'driver', 'admin'].map((r) => (
            <button
              key={r}
              className={`auth-tab ${role === r ? 'active' : ''}`}
              onClick={() => { setRole(r); setError(''); }}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        {error && (
          <div style={{
            background: 'rgba(255,82,82,0.1)', border: '1px solid rgba(255,82,82,0.3)',
            borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            color: 'var(--error)', marginBottom: '1rem', fontSize: '0.9rem',
          }}>
            <FiAlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="new-email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            {loading ? <div className="spinner spinner-sm"></div> : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button
            onClick={fillDemo}
            className="btn btn-sm"
            style={{ color: 'var(--secondary)', background: 'rgba(0,217,255,0.1)', border: '1px solid rgba(0,217,255,0.3)', marginBottom: '1rem' }}
          >
            Fill Demo Credentials ({role})
          </button>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
