import React from 'react';
import { Link } from 'react-router-dom';

const iconFor = (type) => {
  switch (type) {
    case 'bike': return 'fa-motorcycle';
    case 'scooter': return 'fa-bicycle';
    case 'luxury': return 'fa-gem';
    default: return 'fa-car';
  }
};

const VehicleCard = ({ v }) => {
  const img = v.images?.[0];
  const rating = v.rating || 4.5;
  const stars = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  return (
    <Link to={`/vehicles/${v._id}`} className="card group" data-testid={`vehicle-card-${v._id}`}>
      <div className="relative overflow-hidden h-52 bg-gradient-to-br from-ink-850 to-ink-750">
        <i className="fa-solid fa-car-side absolute inset-0 flex items-center justify-center text-5xl text-ink-600 opacity-50"></i>
        {img && (
          <img
            src={img} alt={v.name} loading="lazy"
            className="relative z-10 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}
        <span className="absolute top-3 left-3 z-20 px-3 py-1 bg-brand text-white rounded-full text-xs font-semibold capitalize flex items-center gap-1.5">
          <i className={`fa-solid ${iconFor(v.type)}`}></i> {v.type}
        </span>
        <span className={`absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${v.available ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-red-500/15 text-red-400 border-red-500/30'}`}>
          ● {v.available ? 'Available' : 'Booked'}
        </span>
      </div>
      <div className="p-4">
        <div className="text-base font-bold text-white">{v.name}</div>
        <div className="text-xs text-muted-faint mb-2.5">{v.brand} · {v.color || ''}</div>
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-amber-400 text-sm">{stars}</span>
          <span className="text-[11px] text-muted-faint">({v.totalReviews || 0} reviews)</span>
        </div>
        <div className="flex items-baseline gap-1.5 mb-3.5">
          <span className="text-2xl font-extrabold text-brand">₹{v.pricePerDay}</span>
          <span className="text-xs text-muted-faint">/day</span>
        </div>
        <div className="flex gap-3 flex-wrap">
          {v.specs?.engine && <span className="text-xs text-muted-faint flex items-center gap-1"><i className="fa-solid fa-gear"></i> {v.specs.engine}</span>}
          {v.specs?.mileage && <span className="text-xs text-muted-faint flex items-center gap-1"><i className="fa-solid fa-gas-pump"></i> {v.specs.mileage}</span>}
          {v.specs?.seats && <span className="text-xs text-muted-faint flex items-center gap-1"><i className="fa-solid fa-user"></i> {v.specs.seats}</span>}
        </div>
      </div>
    </Link>
  );
};

export default VehicleCard;
