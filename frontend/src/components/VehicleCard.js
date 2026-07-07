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
    <Link to={`/vehicles/${v._id}`} className="card vehicle-card" data-testid={`vehicle-card-${v._id}`}>
      <div className="vehicle-card-img">
        {img ? <img src={img} alt={v.name} loading="lazy"
          onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : null}
        <span className="vehicle-badge"><i className={`fa-solid ${iconFor(v.type)}`}></i> {v.type}</span>
        <span className={`vehicle-avail ${v.available ? 'available' : 'unavailable'}`}>
          {v.available ? '● Available' : '● Booked'}
        </span>
      </div>
      <div className="vehicle-info">
        <div className="vehicle-name">{v.name}</div>
        <div className="vehicle-brand">{v.brand} · {v.color || ''}</div>
        <div className="vehicle-rating">
          <span className="stars">{stars}</span>
          <span className="rating-count">({v.totalReviews || 0} reviews)</span>
        </div>
        <div className="vehicle-price">
          <span className="price-amount">₹{v.pricePerDay}</span>
          <span className="price-unit">/day</span>
        </div>
        <div className="vehicle-specs">
          {v.specs?.engine && <span className="spec-item"><i className="fa-solid fa-gear"></i> {v.specs.engine}</span>}
          {v.specs?.mileage && <span className="spec-item"><i className="fa-solid fa-gas-pump"></i> {v.specs.mileage}</span>}
          {v.specs?.seats && <span className="spec-item"><i className="fa-solid fa-user"></i> {v.specs.seats}</span>}
        </div>
      </div>
    </Link>
  );
};

export default VehicleCard;
