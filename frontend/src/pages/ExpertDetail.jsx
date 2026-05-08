import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchExpertById, createBooking } from '../api';
import { useSocket } from '../context/SocketContext';
import Toast from '../components/Toast';

const formatDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
};

const validate = (form) => {
  const errs = {};
  if (!form.name.trim()) errs.name = 'Name is required';
  if (!form.email.match(/^\S+@\S+\.\S+$/)) errs.email = 'Valid email required';
  if (!form.phone.match(/^\+?[\d\s\-]{7,15}$/)) errs.phone = 'Valid phone required';
  return errs;
};

const ExpertDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();

  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null); // { date, time }
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [justBooked, setJustBooked] = useState(null);

  const loadExpert = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchExpertById(id);
      setExpert(data);
    } catch {
      setError('Could not load expert details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadExpert(); }, [loadExpert]);

  // Real-time slot updates via Socket.io
  useEffect(() => {
    if (!socket) return;
    const handler = ({ expertId, date, timeSlot }) => {
      if (expertId === id) {
        setExpert((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            timeSlots: prev.timeSlots.map((s) =>
              s.date === date && s.time === timeSlot ? { ...s, isBooked: true } : s
            ),
          };
        });
        setJustBooked(`${date}_${timeSlot}`);
        setTimeout(() => setJustBooked(null), 1000);
      }
    };
    socket.on('slotBooked', handler);
    return () => socket.off('slotBooked', handler);
  }, [socket, id]);

  const groupedSlots = expert
    ? expert.timeSlots.reduce((acc, slot) => {
        if (!acc[slot.date]) acc[slot.date] = [];
        acc[slot.date].push(slot);
        return acc;
      }, {})
    : {};

  const handleSlotSelect = (date, time, isBooked) => {
    if (isBooked) return;
    setSelectedSlot({ date, time });
  };

  const handleSubmit = async () => {
    const errs = validate(form);
    if (!selectedSlot) errs.slot = 'Please select a time slot';
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      await createBooking({
        expertId: id,
        ...form,
        date: selectedSlot.date,
        timeSlot: selectedSlot.time,
      });
      setToast({ message: 'Booking confirmed! Check "My Bookings" for details.', type: 'success' });
      setSelectedSlot(null);
      setForm({ name: '', email: '', phone: '', notes: '' });
      loadExpert();
    } catch (err) {
      const msg = err.response?.data?.message || 'Booking failed. Please try again.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page"><div className="loading-center"><div className="spinner" /></div></div>;
  if (error || !expert) return <div className="page"><div className="empty-state"><h3>{error || 'Expert not found'}</h3></div></div>;

  return (
    <div className="page detail-page">
      <button className="back-btn" onClick={() => navigate('/')}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
        All Experts
      </button>

      <div className="detail-header">
        <div className="detail-avatar">{expert.avatar || expert.name.slice(0, 2).toUpperCase()}</div>
        <div className="detail-info">
          <h2>{expert.name}</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.3rem' }}>{expert.bio}</p>
          <div className="detail-meta">
            <span className="badge accent">{expert.category}</span>
            <span className="badge">⭐ {expert.rating.toFixed(1)}</span>
            <span className="badge">{expert.experience} yrs experience</span>
          </div>
        </div>
      </div>

      <div className="slots-section">
        <h3>Available Time Slots</h3>
        {Object.keys(groupedSlots).length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No slots available at this time.</p>
        ) : (
          Object.entries(groupedSlots).sort(([a], [b]) => a.localeCompare(b)).map(([date, slots]) => (
            <div key={date} className="date-group">
              <div className="date-label">{formatDate(date)}</div>
              <div className="slots-grid">
                {slots.map((slot) => {
                  const key = `${slot.date}_${slot.time}`;
                  const isSelected = selectedSlot?.date === slot.date && selectedSlot?.time === slot.time;
                  return (
                    <button
                      key={key}
                      className={`slot-btn${slot.isBooked ? ' booked' : ''}${isSelected ? ' selected' : ''}${justBooked === key ? ' just-booked' : ''}`}
                      onClick={() => handleSlotSelect(slot.date, slot.time, slot.isBooked)}
                      disabled={slot.isBooked}
                    >
                      {slot.time}
                      {slot.isBooked && ' ✕'}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedSlot && (
        <div className="booking-form-wrap">
          <h3>Book Your Session</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Name *</label>
              <input
                className={`form-input${formErrors.name ? ' error' : ''}`}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name"
              />
              {formErrors.name && <span className="error-msg">{formErrors.name}</span>}
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                className={`form-input${formErrors.email ? ' error' : ''}`}
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
              />
              {formErrors.email && <span className="error-msg">{formErrors.email}</span>}
            </div>
            <div className="form-group">
              <label>Phone *</label>
              <input
                className={`form-input${formErrors.phone ? ' error' : ''}`}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98765 43210"
              />
              {formErrors.phone && <span className="error-msg">{formErrors.phone}</span>}
            </div>
            <div className="form-group">
              <label>Selected Slot</label>
              <div className="selected-slot-display">
                📅 {formatDate(selectedSlot.date)} at {selectedSlot.time}
              </div>
            </div>
            <div className="form-group full">
              <label>Notes (optional)</label>
              <textarea
                className="form-textarea"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="What would you like to discuss?"
              />
            </div>
          </div>
          {formErrors.slot && <p className="error-msg" style={{ marginBottom: '1rem' }}>{formErrors.slot}</p>}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Confirming...' : '✓ Confirm Booking'}
            </button>
            <button className="btn-ghost" onClick={() => { setSelectedSlot(null); setFormErrors({}); }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default ExpertDetail;
