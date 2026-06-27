import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiNavigation2, FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
  };

  const closeMobile = () => setMobileOpen(false);

  const userLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/book', label: 'Book Ride' },
    { path: '/history', label: 'History' },
  ];

  const driverLinks = [
    { path: '/driver', label: 'Dashboard' },
  ];

  const adminLinks = [
    { path: '/admin', label: 'Dashboard' },
  ];

  const getLinks = () => {
    if (!user) return [];
    if (user.role === 'admin') return adminLinks;
    if (user.role === 'driver') return driverLinks;
    return userLinks;
  };

  const links = getLinks();

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            <FiNavigation2 size={24} />
            <span>Ucab</span>
          </Link>

          <div className="navbar-links">
            {links.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`navbar-link ${isActive(link.path) ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}

            {!user ? (
              <>
                <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--text-primary)' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 600, color: 'white',
                  }}>
                    {getInitials(user.name)}
                  </div>
                  <span style={{ fontWeight: 500 }}>{user.name?.split(' ')[0]}</span>
                </Link>
                <button onClick={handleLogout} className="btn btn-icon" style={{ color: 'var(--text-secondary)' }}>
                  <FiLogOut size={18} />
                </button>
              </div>
            )}
          </div>

          <button className="navbar-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </nav>

      {mobileOpen && <div className="navbar-mobile-overlay open" onClick={closeMobile} />}
      <div className={`navbar-mobile ${mobileOpen ? 'open' : ''}`}>
        {links.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={`navbar-link ${isActive(link.path) ? 'active' : ''}`}
            onClick={closeMobile}
            style={{ display: 'block', padding: '0.75rem 0' }}
          >
            {link.label}
          </Link>
        ))}
        {!user ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            <Link to="/login" className="btn btn-secondary" onClick={closeMobile}>Login</Link>
            <Link to="/register" className="btn btn-primary" onClick={closeMobile}>Register</Link>
          </div>
        ) : (
          <div style={{ marginTop: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
            <Link to="/profile" onClick={closeMobile} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 600, color: 'white',
              }}>
                {getInitials(user.name)}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{user.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</div>
              </div>
            </Link>
            <button onClick={handleLogout} className="btn btn-danger w-full" style={{ marginTop: '0.5rem' }}>
              <FiLogOut size={16} /> Logout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;
