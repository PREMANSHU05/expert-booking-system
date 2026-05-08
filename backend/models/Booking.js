const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    expertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expert', required: true },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      required: true,
      match: [/^\+?[\d\s\-]{7,15}$/, 'Please enter a valid phone number'],
    },
    date: { type: String, required: true },
    timeSlot: { type: String, required: true },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

// Compound index to prevent double booking
bookingSchema.index({ expertId: 1, date: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);
