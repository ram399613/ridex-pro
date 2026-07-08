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

  const linkCls = ({ isActive }) =>
    `px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-white bg-ink-800' : 'text-muted hover:text-white hover:bg-ink-800'}`;

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 backdrop-blur-xl border-b border-ink-700 transition-colors ${scrolled ? 'bg-ink-950/95 shadow-card' : 'bg-ink-950/80'}`} data-testid="navbar">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-xl tracking-tight" data-testid="nav-logo">
          <div className="w-9 h-9 bg-brand rounded-lg flex items-center justify-center text-white"><i className="fa-solid fa-motorcycle"></i></div>
          Ride<span className="text-brand">X</span>
        </Link>

        <ul className={`md:flex items-center gap-1 ${open ? 'flex flex-col absolute top-16 inset-x-0 bg-ink-900 border-b border-ink-700 p-4 z-40' : 'hidden'}`}>
          <li><NavLink to="/" end className={linkCls} data-testid="nav-link-home">Home</NavLink></li>
          <li><NavLink to="/vehicles" className={linkCls} data-testid="nav-link-vehicles">Vehicles</NavLink></li>
          <li><NavLink to="/contact" className={linkCls} data-testid="nav-link-contact">Contact</NavLink></li>
          {user?.role === 'admin' && <li><NavLink to="/admin" className={linkCls} data-testid="nav-link-admin">Admin</NavLink></li>}
        </ul>

        <div className="flex items-center gap-2.5">
          {!user ? (
            <>
              <Link to="/login" className="btn-ghost btn-sm" data-testid="nav-btn-login">Login</Link>
              <Link to="/register" className="btn-primary btn-sm" data-testid="nav-btn-register">Sign Up</Link>
            </>
          ) : (
            <div className="relative group" data-testid="nav-user-menu" tabIndex="0">
              <button className="flex items-center gap-2 px-3.5 py-2 bg-ink-800 rounded-lg text-sm border border-ink-700 hover:border-brand transition-colors">
                <div className="w-7 h-7 bg-brand rounded-full flex items-center justify-center text-xs font-bold text-white">{initials || 'U'}</div>
                <span>{user.name?.split(' ')[0]}</span>
                <i className="fa-solid fa-chevron-down text-[10px]"></i>
              </button>
              <div className="absolute top-full right-0 mt-2 w-56 bg-ink-800 border border-ink-700 rounded-xl overflow-hidden opacity-0 invisible -translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 transition-all shadow-card">
                <Link to="/dashboard" className="flex items-center gap-2.5 px-4 py-3 text-sm text-muted hover:bg-ink-750 hover:text-white" data-testid="dropdown-dashboard"><i className="fa-solid fa-gauge w-4"></i> Dashboard</Link>
                <Link to="/my-bookings" className="flex items-center gap-2.5 px-4 py-3 text-sm text-muted hover:bg-ink-750 hover:text-white" data-testid="dropdown-my-bookings"><i className="fa-solid fa-calendar-check w-4"></i> My Bookings</Link>
                {user.role === 'admin' && <Link to="/admin" className="flex items-center gap-2.5 px-4 py-3 text-sm text-muted hover:bg-ink-750 hover:text-white" data-testid="dropdown-admin"><i className="fa-solid fa-user-shield w-4"></i> Admin Panel</Link>}
                <div className="h-px bg-ink-700"></div>
                <button onClick={doLogout} className="w-full text-left flex items-center gap-2.5 px-4 py-3 text-sm text-muted hover:bg-ink-750 hover:text-white" data-testid="dropdown-logout"><i className="fa-solid fa-right-from-bracket w-4"></i> Logout</button>
              </div>
            </div>
          )}
          <button className="md:hidden flex flex-col gap-1 p-1" onClick={() => setOpen(!open)} data-testid="nav-hamburger" aria-label="Menu">
            <span className="w-6 h-0.5 bg-white rounded"></span>
            <span className="w-6 h-0.5 bg-white rounded"></span>
            <span className="w-6 h-0.5 bg-white rounded"></span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
