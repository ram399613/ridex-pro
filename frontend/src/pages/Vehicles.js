import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import VehicleCard from '../components/VehicleCard';

const TYPES = ['all', 'bike', 'scooter', 'car', 'luxury'];

const Vehicles = () => {
  const [params, setParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState(params.get('type') || 'all');
  const [sort, setSort] = useState('recent');
  const [search, setSearch] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [onlyAvail, setOnlyAvail] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const q = new URLSearchParams();
        if (type !== 'all') q.set('type', type);
        if (search) q.set('search', search);
        if (maxPrice) q.set('maxPrice', maxPrice);
        if (sort !== 'recent') q.set('sort', sort);
        if (onlyAvail) q.set('available', 'true');
        const { data } = await api.get(`/vehicles?${q.toString()}`);
        setVehicles(data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [type, sort, search, maxPrice, onlyAvail]);

  useEffect(() => {
    const onUpdated = (e) => setVehicles(prev => prev.map(v => v._id === e.detail._id ? e.detail : v));
    const onCreated = (e) => setVehicles(prev => [e.detail, ...prev]);
    const onDeleted = (e) => setVehicles(prev => prev.filter(v => v._id !== e.detail._id));
    window.addEventListener('ridex:vehicle-updated', onUpdated);
    window.addEventListener('ridex:vehicle-created', onCreated);
    window.addEventListener('ridex:vehicle-deleted', onDeleted);
    return () => {
      window.removeEventListener('ridex:vehicle-updated', onUpdated);
      window.removeEventListener('ridex:vehicle-created', onCreated);
      window.removeEventListener('ridex:vehicle-deleted', onDeleted);
    };
  }, []);

  useEffect(() => {
    if (type === 'all') params.delete('type'); else params.set('type', type);
    setParams(params, { replace: true });

  }, [type]);

  const results = useMemo(() => vehicles, [vehicles]);

  const clearFilters = () => { setType('all'); setSort('recent'); setSearch(''); setMaxPrice(''); setOnlyAvail(false); };

  return (
    <>
      <header className="page-header">
        <div className="container">
          <div className="breadcrumb"><Link to="/">Home</Link> / <span>Vehicles</span></div>
          <h1>Explore <span style={{ color: 'var(--orange)' }}>Vehicles</span></h1>
          <p style={{ marginTop: 8 }}>{results.length} rides available</p>
        </div>
      </header>

      <section className="section container">
        <div className="vehicles-layout">
          <aside className="filter-sidebar" data-testid="filter-sidebar">
            <div className="filter-title">Filters <button className="filter-clear" onClick={clearFilters} data-testid="filter-clear">Clear all</button></div>

            <div className="filter-section">
              <div className="filter-section-title">Search</div>
              <input className="form-control" placeholder="Yamaha, Swift…" value={search} onChange={(e) => setSearch(e.target.value)} data-testid="filter-search" />
            </div>

            <div className="filter-section">
              <div className="filter-section-title">Type</div>
              <div className="filter-options">
                {TYPES.map(t => (
                  <div key={t} className="filter-option">
                    <input type="radio" id={`t-${t}`} name="type" checked={type === t} onChange={() => setType(t)} data-testid={`filter-type-${t}`} />
                    <label htmlFor={`t-${t}`} style={{ textTransform: 'capitalize' }}>{t}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <div className="filter-section-title">Sort by</div>
              <select className="form-control" value={sort} onChange={(e) => setSort(e.target.value)} data-testid="filter-sort">
                <option value="recent">Recently added</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="rating">Top rated</option>
              </select>
            </div>

            <div className="filter-section">
              <div className="filter-section-title">Max price / day</div>
              <div className="price-inputs">
                <input className="form-control" type="number" placeholder="₹" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} data-testid="filter-max-price" />
              </div>
            </div>

            <div className="filter-section">
              <div className="filter-option">
                <input type="checkbox" id="avail" checked={onlyAvail} onChange={(e) => setOnlyAvail(e.target.checked)} data-testid="filter-available" />
                <label htmlFor="avail">Only available</label>
              </div>
            </div>
          </aside>

          <div>
            {loading ? (
              <div style={{ padding: 80 }}><div className="spinner"></div></div>
            ) : results.length === 0 ? (
              <div className="empty-state"><i className="fa-solid fa-magnifying-glass"></i>No vehicles match your filters.</div>
            ) : (
              <div className="vehicles-grid" data-testid="vehicles-grid">
                {results.map(v => <VehicleCard key={v._id} v={v} />)}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Vehicles;
