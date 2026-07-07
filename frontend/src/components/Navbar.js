import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '';

  const doLogout = () => { logout(); navigate('/'); };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} data-testid="navbar">
      <div className="nav-inner">
        <Link to="/" className="nav-logo" data-testid="nav-logo">
          <div className="nav-logo-icon"><i className="fa-solid fa-motorcycle"></i></div>
          Ride<span>X</span>
        </Link>

        <ul className={`nav-links ${open ? 'open' : ''}`}>
          <li><NavLink to="/" end data-testid="nav-link-home">Home</NavLink></li>
          <li><NavLink to="/vehicles" data-testid="nav-link-vehicles">Vehicles</NavLink></li>
          <li><NavLink to="/contact" data-testid="nav-link-contact">Contact</NavLink></li>
          {user?.role === 'admin' && <li><NavLink to="/admin" data-testid="nav-link-admin">Admin</NavLink></li>}
        </ul>

        <div className="nav-actions">
          {!user ? (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm" data-testid="nav-btn-login">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm" data-testid="nav-btn-register">Sign Up</Link>
            </>
          ) : (
            <div className="nav-user-btn" data-testid="nav-user-menu" tabIndex="0">
              <div className="nav-avatar">{initials || 'U'}</div>
              <span>{user.name?.split(' ')[0]}</span>
              <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.7rem' }}></i>
              <div className="nav-dropdown">
                <Link to="/dashboard" data-testid="dropdown-dashboard"><i className="fa-solid fa-gauge"></i> Dashboard</Link>
                <Link to="/my-bookings" data-testid="dropdown-my-bookings"><i className="fa-solid fa-calendar-check"></i> My Bookings</Link>
                {user.role === 'admin' && <Link to="/admin" data-testid="dropdown-admin"><i className="fa-solid fa-user-shield"></i> Admin Panel</Link>}
                <div className="divider"></div>
                <button onClick={doLogout} data-testid="dropdown-logout"><i className="fa-solid fa-right-from-bracket"></i> Logout</button>
              </div>
            </div>
          )}
          <button className="nav-hamburger" onClick={() => setOpen(!open)} data-testid="nav-hamburger" aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
