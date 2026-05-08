import React, { useState } from 'react';
import { fetchBookingsByEmail } from '../api';
import Toast from '../components/Toast';

const formatDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

const MyBookings = () => {
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const handleSearch = async () => {
    if (!email.match(/^\S+@\S+\.\S+$/)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await fetchBookingsByEmail(email);
      setBookings(data);
      setSearched(true);
    } catch {
      setToast({ message: 'Failed to fetch bookings. Try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div style={{ marginBottom: '2rem', animation: 'fadeUp 0.5s ease' }}>
        <div className="hero-tag" style={{ display: 'inline-block' }}>My Sessions</div>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginTop: '0.75rem', letterSpacing: '-0.5px' }}>
          Your Bookings
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Enter your email address to view all booked sessions.
        </p>
      </div>

      <div className="email-form">
        <input
          className={`form-input${error ? ' error' : ''}`}
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(''); }}
          placeholder="Enter your email address"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className="btn-primary" onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'View Bookings'}
        </button>
      </div>
      {error && <p className="error-msg" style={{ marginBottom: '1rem', marginTop: '-0.5rem' }}>{error}</p>}

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : searched && bookings.length === 0 ? (
        <div className="empty-state">
          <h3>No bookings found</h3>
          <p>No sessions found for <strong>{email}</strong>. Make sure the email matches what you used when booking.</p>
        </div>
      ) : bookings.length > 0 ? (
        <>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            Found {bookings.length} booking{bookings.length !== 1 ? 's' : ''} for <strong style={{ color: 'var(--text)' }}>{email}</strong>
          </p>
          <div className="bookings-list">
            {bookings.map((booking, i) => (
              <div key={booking._id} className="booking-card" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="booking-card-left">
                  <h4>
                    {booking.expertId?.name || 'Expert'}
                    <span style={{ color: 'var(--accent)', fontFamily: 'DM Sans', fontWeight: 400, fontSize: '0.85rem', marginLeft: '0.6rem' }}>
                      {booking.expertId?.category}
                    </span>
                  </h4>
                  <p className="booking-detail">
                    📅 {formatDate(booking.date)} at {booking.timeSlot}
                  </p>
                  {booking.notes && (
                    <p className="booking-detail" style={{ marginTop: '0.3rem', fontStyle: 'italic' }}>
                      "{booking.notes}"
                    </p>
                  )}
                  <p className="booking-detail" style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    Booked {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <span className={`status-badge status-${booking.status}`}>
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default MyBookings;
