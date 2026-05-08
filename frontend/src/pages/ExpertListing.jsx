import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchExperts } from '../api';

const CATEGORIES = ['All', 'Technology', 'Finance', 'Health', 'Design', 'Marketing', 'Legal', 'Education', 'Business'];

const StarRating = ({ rating }) => {
  const full = Math.floor(rating);
  return (
    <span className="stars">
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
    </span>
  );
};

const ExpertCard = ({ expert, index, onClick }) => (
  <div
    className="expert-card"
    style={{ animationDelay: `${index * 0.07}s` }}
    onClick={() => onClick(expert._id)}
    role="button"
    tabIndex={0}
    onKeyPress={(e) => e.key === 'Enter' && onClick(expert._id)}
  >
    <div className="card-header">
      <div className="avatar">{expert.avatar || expert.name.slice(0, 2).toUpperCase()}</div>
      <div>
        <div className="card-name">{expert.name}</div>
        <div className="card-category">{expert.category}</div>
      </div>
    </div>
    <p className="card-bio">{expert.bio}</p>
    <div className="card-meta">
      <span className="meta-item">
        <StarRating rating={expert.rating} />
        <span style={{ marginLeft: 4 }}>{expert.rating.toFixed(1)}</span>
      </span>
      <span className="meta-item">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        {expert.experience} yrs
      </span>
    </div>
  </div>
);

const ExpertListing = () => {
  const navigate = useNavigate();
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchDebounce, setSearchDebounce] = useState('');

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounce(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const loadExperts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await fetchExperts({ page, limit: 6, category, search: searchDebounce });
      setExperts(data.experts);
      setTotalPages(data.pages);
    } catch {
      setError('Failed to load experts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, category, searchDebounce]);

  useEffect(() => { loadExperts(); }, [loadExperts]);
  useEffect(() => { setPage(1); }, [category, searchDebounce]);

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-tag">Real-Time Booking</div>
        <h1>Connect with<br />Domain Experts</h1>
        <p>Book 1-on-1 sessions with verified professionals across tech, finance, health, and more.</p>
      </div>

      <div className="filters">
        <div className="search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="search-input"
            placeholder="Search experts by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : error ? (
        <div className="empty-state">
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button className="btn-ghost" style={{ marginTop: '1rem' }} onClick={loadExperts}>Retry</button>
        </div>
      ) : experts.length === 0 ? (
        <div className="empty-state">
          <h3>No experts found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <div className="expert-grid">
            {experts.map((expert, i) => (
              <ExpertCard key={expert._id} expert={expert} index={i} onClick={(id) => navigate(`/experts/${id}`)} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >←</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`page-btn${page === i + 1 ? ' active' : ''}`}
                  onClick={() => setPage(i + 1)}
                >{i + 1}</button>
              ))}
              <button
                className="page-btn"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >→</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExpertListing;
