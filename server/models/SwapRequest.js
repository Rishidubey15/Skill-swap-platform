import mongoose from 'mongoose';

const swapRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requesterSkill: {
    name: String,
    description: String
  },
  recipientSkill: {
    name: String,
    description: String
  },
  message: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  scheduledDate: {
    type: Date
  },
  duration: {
    type: Number // in hours
  }
}, {
  timestamps: true
});

export default mongoose.model('SwapRequest', swapRequestSchema);