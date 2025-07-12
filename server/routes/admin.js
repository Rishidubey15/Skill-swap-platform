import express from 'express';
import User from '../models/User.js';
import SwapRequest from '../models/SwapRequest.js';
import Rating from '../models/Rating.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all users
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Ban/unban user
router.put('/users/:id/ban', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { isBanned } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Update failed', error: error.message });
  }
});

// Get all swap requests
router.get('/swaps', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const swaps = await SwapRequest.find()
      .populate(['requester', 'recipient'], 'name email')
      .sort({ createdAt: -1 });
    res.json(swaps);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get platform statistics
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isBanned: false });
    const totalSwaps = await SwapRequest.countDocuments();
    const completedSwaps = await SwapRequest.countDocuments({ status: 'completed' });
    const pendingSwaps = await SwapRequest.countDocuments({ status: 'pending' });
    const totalRatings = await Rating.countDocuments();

    res.json({
      totalUsers,
      activeUsers,
      totalSwaps,
      completedSwaps,
      pendingSwaps,
      totalRatings
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;