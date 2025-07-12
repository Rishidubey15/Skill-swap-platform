
import express from 'express';
import User from '../models/User.js';
import SwapRequest from '../models/SwapRequest.js';
import Rating from '../models/Rating.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Helper: simple inappropriate keywords
const bannedKeywords = ['spam', 'scam', 'inappropriate', 'offensive', 'xxx', 'fake', 'abuse'];

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

// Reject inappropriate or spammy skill descriptions
router.patch('/skills/:userId/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { skillType, skillIndex, reason } = req.body; // skillType: 'skillsOffered' or 'skillsWanted'
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user[skillType] || !user[skillType][skillIndex]) return res.status(400).json({ message: 'Skill not found' });

    // Mark skill as rejected (or remove it)
    user[skillType][skillIndex].rejected = true;
    user[skillType][skillIndex].rejectionReason = reason || 'Inappropriate or spammy description';
    await user.save();
    res.json({ message: 'Skill rejected', user });
  } catch (error) {
    res.status(400).json({ message: 'Failed to reject skill', error: error.message });
  }
});

// Monitor swaps by status
router.get('/swaps/:status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const swaps = await SwapRequest.find({ status: req.params.status })
      .populate(['requester', 'recipient'], 'name email')
      .sort({ createdAt: -1 });
    res.json(swaps);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Platform-wide messages (in-memory for demo)
let platformMessages = [];
// Announce a new message
router.post('/message', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, content } = req.body;
    platformMessages.push({ title, content, date: new Date() });
    res.json({ message: 'Message sent to all users', messages: platformMessages });
  } catch (error) {
    res.status(400).json({ message: 'Failed to send message', error: error.message });
  }
});
// Get all platform-wide messages
router.get('/messages', authenticateToken, async (req, res) => {
  try {
    res.json({ messages: platformMessages });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
  }
});

// Download reports (user activity, feedback logs, swap stats)
router.get('/report/:type', authenticateToken, requireAdmin, async (req, res) => {
  try {
    let data;
    if (req.params.type === 'user-activity') {
      data = await User.find().select('-password');
    } else if (req.params.type === 'feedback-logs') {
      data = await Rating.find();
    } else if (req.params.type === 'swap-stats') {
      data = await SwapRequest.find();
    } else {
      return res.status(400).json({ message: 'Invalid report type' });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to download report', error: error.message });
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