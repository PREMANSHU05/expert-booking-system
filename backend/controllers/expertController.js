const Expert = require('../models/Expert');

// GET /experts (with pagination + filter)
exports.getExperts = async (req, res) => {
  try {
    const { page = 1, limit = 6, category, search } = req.query;
    const query = {};

    if (category && category !== 'All') query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const total = await Expert.countDocuments(query);
    const experts = await Expert.find(query)
      .select('-timeSlots')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ rating: -1 });

    res.json({
      experts,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /experts/:id
exports.getExpertById = async (req, res) => {
  try {
    const expert = await Expert.findById(req.params.id);
    if (!expert) return res.status(404).json({ message: 'Expert not found' });
    res.json(expert);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
