const Booking = require('../models/Booking');
const Expert = require('../models/Expert');

// POST /bookings
exports.createBooking = async (req, res) => {
  const { expertId, name, email, phone, date, timeSlot, notes } = req.body;

  // Validation
  if (!expertId || !name || !email || !phone || !date || !timeSlot) {
    return res.status(400).json({ message: 'All required fields must be provided.' });
  }

  try {
    // Find expert and check slot atomically using findOneAndUpdate
    const expert = await Expert.findOneAndUpdate(
      {
        _id: expertId,
        timeSlots: {
          $elemMatch: { date, time: timeSlot, isBooked: false },
        },
      },
      {
        $set: { 'timeSlots.$[slot].isBooked': true },
      },
      {
        arrayFilters: [{ 'slot.date': date, 'slot.time': timeSlot, 'slot.isBooked': false }],
        new: true,
      }
    );

    if (!expert) {
      return res.status(409).json({ message: 'This slot is already booked or unavailable. Please choose another.' });
    }

    // Create booking
    const booking = await Booking.create({ expertId, name, email, phone, date, timeSlot, notes });

    // Emit real-time slot update via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('slotBooked', { expertId, date, timeSlot });
    }

    res.status(201).json({ message: 'Booking confirmed!', booking });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'This slot is already booked. Please choose another.' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PATCH /bookings/:id/status
exports.updateBookingStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Pending', 'Confirmed', 'Completed'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value.' });
  }

  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /bookings?email=
exports.getBookingsByEmail = async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: 'Email is required.' });

  try {
    const bookings = await Booking.find({ email: email.toLowerCase() })
      .populate('expertId', 'name category avatar')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
