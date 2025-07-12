import express from 'express';
import SwapRequest from '../models/SwapRequest.js';
import Rating from '../models/Rating.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create swap request
router.post('/', authenticateToken, async (req, res) => {
  try {
    const swapRequest = new SwapRequest({
      ...req.body,
      requester: req.user._id
    });

    await swapRequest.save();
    await swapRequest.populate(['requester', 'recipient'], 'name email');

    res.status(201).json(swapRequest);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create swap request', error: error.message });
  }
});

// Get user's swap requests
router.get('/my-requests', authenticateToken, async (req, res) => {
  try {
    const requests = await SwapRequest.find({
      $or: [
        { requester: req.user._id },
        { recipient: req.user._id }
      ]
    })
    .populate(['requester', 'recipient'], 'name email profilePhoto')
    .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update swap request status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const swapRequest = await SwapRequest.findById(req.params.id);

    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Check if user is authorized to update this request
    const isRecipient = swapRequest.recipient.toString() === req.user._id.toString();
    const isRequester = swapRequest.requester.toString() === req.user._id.toString();

    if (!isRecipient && !isRequester) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Only recipient can accept/reject, only requester can cancel
    if (status === 'accepted' || status === 'rejected') {
      if (!isRecipient) {
        return res.status(403).json({ message: 'Only recipient can accept/reject' });
      }
    } else if (status === 'cancelled') {
      if (!isRequester) {
        return res.status(403).json({ message: 'Only requester can cancel' });
      }
    }

    swapRequest.status = status;
    await swapRequest.save();

    await swapRequest.populate(['requester', 'recipient'], 'name email profilePhoto');
    res.json(swapRequest);
  } catch (error) {
    res.status(400).json({ message: 'Update failed', error: error.message });
  }
});

// Add rating for completed swap
router.post('/:id/rating', authenticateToken, async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const swapRequest = await SwapRequest.findById(req.params.id);

    if (!swapRequest || swapRequest.status !== 'completed') {
      return res.status(400).json({ message: 'Swap not found or not completed' });
    }

    // Check if user is part of this swap
    const isRequester = swapRequest.requester.toString() === req.user._id.toString();
    const isRecipient = swapRequest.recipient.toString() === req.user._id.toString();

    if (!isRequester && !isRecipient) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const ratedUser = isRequester ? swapRequest.recipient : swapRequest.requester;

    // Check if rating already exists
    const existingRating = await Rating.findOne({
      swap: swapRequest._id,
      rater: req.user._id
    });

    if (existingRating) {
      return res.status(400).json({ message: 'Rating already submitted' });
    }

    // Create rating
    const newRating = new Rating({
      swap: swapRequest._id,
      rater: req.user._id,
      rated: ratedUser,
      rating,
      feedback
    });

    await newRating.save();

    // Update user's average rating
    const userRatings = await Rating.find({ rated: ratedUser });
    const totalRating = userRatings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / userRatings.length;

    await User.findByIdAndUpdate(ratedUser, {
      'rating.average': averageRating,
      'rating.count': userRatings.length
    });

    res.status(201).json(newRating);
  } catch (error) {
    res.status(400).json({ message: 'Rating failed', error: error.message });
  }
});

export default router;