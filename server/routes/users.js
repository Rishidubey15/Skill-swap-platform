import express from 'express';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; // Don't allow password updates here
    delete updates.isAdmin; // Don't allow admin status changes
    delete updates.isBanned; // Don't allow ban status changes

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Update failed', error: error.message });
  }
});

// Search users by skills
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { skill, location } = req.query;
    
    let query = {
      isPublic: true,
      isBanned: false,
      _id: { $ne: req.user._id } // Exclude current user
    };

    if (skill) {
      query.$or = [
        { 'skillsOffered.name': { $regex: skill, $options: 'i' } }
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const users = await User.find(query)
      .select('-password -email')
      .sort({ 'rating.average': -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
});

// Get all public users
router.get('/browse', authenticateToken, async (req, res) => {
  try {
    const users = await User.find({
      isPublic: true,
      isBanned: false,
      _id: { $ne: req.user._id }
    })
    .select('-password -email')
    .sort({ 'rating.average': -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Browse failed', error: error.message });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      isPublic: true,
      isBanned: false
    }).select('-password -email');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;