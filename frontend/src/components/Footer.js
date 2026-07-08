import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-ink-900 border-t border-ink-700 pt-16 mt-20" data-testid="footer">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12 px-6">
      <div>
        <div className="text-xl font-extrabold mb-3.5">Ride<span className="text-brand">X</span></div>
        <p className="text-sm text-muted leading-relaxed max-w-xs">Rent premium bikes, scooters, cars & luxury rides on demand. Real-time availability, instant confirmation.</p>
        <div className="flex gap-3 mt-5">
          {[
            { i: 'facebook-f', l: 'fb' }, { i: 'twitter', l: 'tw' }, { i: 'instagram', l: 'ig' }, { i: 'linkedin-in', l: 'in' },
          ].map(s => (
            <button key={s.l} aria-label={s.l} className="w-9 h-9 rounded-full bg-ink-800 border border-ink-700 flex items-center justify-center text-muted-faint hover:border-brand hover:text-brand hover:bg-brand/10 transition-colors">
              <i className={`fa-brands fa-${s.i}`}></i>
            </button>
          ))}
        </div>
      </div>
      {[
        { title: 'Explore', links: [
          ['/vehicles?type=bike', 'Bikes'], ['/vehicles?type=scooter', 'Scooters'], ['/vehicles?type=car', 'Cars'], ['/vehicles?type=luxury', 'Luxury'],
        ]},
        { title: 'Company', links: [['/', 'Home'], ['/vehicles', 'Vehicles'], ['/contact', 'Contact'], ['/dashboard', 'Dashboard']] },
      ].map(col => (
        <div key={col.title}>
          <div className="text-sm font-bold uppercase tracking-wider mb-4">{col.title}</div>
          <div className="flex flex-col gap-2.5">
            {col.links.map(([to, label]) => <Link key={to+label} to={to} className="text-sm text-muted-faint hover:text-brand transition-colors">{label}</Link>)}
          </div>
        </div>
      ))}
      <div>
        <div className="text-sm font-bold uppercase tracking-wider mb-4">Contact</div>
        <div className="flex flex-col gap-2.5 text-sm text-muted-faint">
          <span><i className="fa-solid fa-envelope mr-2"></i> support@ridex.com</span>
          <span><i className="fa-solid fa-phone mr-2"></i> +91 98765 43210</span>
          <span><i className="fa-solid fa-location-dot mr-2"></i> Bangalore, India</span>
        </div>
      </div>
    </div>
    <div className="border-t border-ink-700 py-5 text-center text-xs text-muted-faint">© {new Date().getFullYear()} RideX. Built for riders.</div>
  </footer>
);

export default Footer;
