const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

/*
|--------------------------------------------------------------------------
| GET /users/me
|--------------------------------------------------------------------------
*/
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/*
|--------------------------------------------------------------------------
| PUT /users/me
|--------------------------------------------------------------------------
*/
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    // 1. Update Name/Email
    if (name) user.name = name;
    
    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: 'Email already in use' });
      user.email = email;
    }

    // 2. Update Password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password required to set a new one' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password incorrect' });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error("PROFILE UPDATE ERROR:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
