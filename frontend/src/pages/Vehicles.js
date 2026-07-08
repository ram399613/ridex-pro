import React, { useEffect, useState } from 'react';
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
      } finally { setLoading(false); }
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

  const clearFilters = () => { setType('all'); setSort('recent'); setSearch(''); setMaxPrice(''); setOnlyAvail(false); };

  return (
    <>
      <header className="pt-28 pb-12 bg-ink-900/80 border-b border-ink-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2 text-xs text-muted-faint mb-3"><Link to="/" className="hover:text-brand">Home</Link> / <span className="text-white">Vehicles</span></div>
          <h1 className="text-4xl font-extrabold">Explore <span className="text-brand">Vehicles</span></h1>
          <p className="mt-2 text-muted">{vehicles.length} rides available</p>
        </div>
      </header>

      <section className="py-16 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-[260px,1fr] gap-6 items-start">
          <aside className="bg-ink-800 border border-ink-700 rounded-2xl p-6 lg:sticky lg:top-24" data-testid="filter-sidebar">
            <div className="flex items-center justify-between mb-5">
              <div className="font-bold text-base">Filters</div>
              <button onClick={clearFilters} className="text-xs text-brand font-medium hover:underline" data-testid="filter-clear">Clear all</button>
            </div>

            <div className="border-b border-ink-700 pb-5 mb-5">
              <div className="text-xs font-semibold text-muted-faint uppercase tracking-wide mb-3">Search</div>
              <input className="form-control" placeholder="Yamaha, Swift…" value={search} onChange={(e) => setSearch(e.target.value)} data-testid="filter-search" />
            </div>

            <div className="border-b border-ink-700 pb-5 mb-5">
              <div className="text-xs font-semibold text-muted-faint uppercase tracking-wide mb-3">Type</div>
              <div className="flex flex-col gap-2">
                {TYPES.map(t => (
                  <label key={t} className="flex items-center gap-2.5 cursor-pointer text-sm text-muted hover:text-white">
                    <input type="radio" name="type" checked={type === t} onChange={() => setType(t)} className="accent-brand w-4 h-4 cursor-pointer" data-testid={`filter-type-${t}`} />
                    <span className="capitalize">{t}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-b border-ink-700 pb-5 mb-5">
              <div className="text-xs font-semibold text-muted-faint uppercase tracking-wide mb-3">Sort by</div>
              <select className="form-control" value={sort} onChange={(e) => setSort(e.target.value)} data-testid="filter-sort">
                <option value="recent">Recently added</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="rating">Top rated</option>
              </select>
            </div>

            <div className="border-b border-ink-700 pb-5 mb-5">
              <div className="text-xs font-semibold text-muted-faint uppercase tracking-wide mb-3">Max price / day</div>
              <input className="form-control" type="number" placeholder="₹" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} data-testid="filter-max-price" />
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer text-sm text-muted hover:text-white">
              <input type="checkbox" checked={onlyAvail} onChange={(e) => setOnlyAvail(e.target.checked)} className="accent-brand w-4 h-4 cursor-pointer" data-testid="filter-available" />
              Only available
            </label>
          </aside>

          <div>
            {loading ? (
              <div className="py-20"><div className="spinner"></div></div>
            ) : vehicles.length === 0 ? (
              <div className="text-center py-20 text-muted-faint"><i className="fa-solid fa-magnifying-glass text-5xl text-ink-600 block mb-4"></i>No vehicles match your filters.</div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6" data-testid="vehicles-grid">
                {vehicles.map(v => <VehicleCard key={v._id} v={v} />)}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Vehicles;
