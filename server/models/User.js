import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  location: {
    type: String,
    trim: true
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  skillsOffered: [{
    name: String,
    description: String,
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Intermediate'
    }
  }],
  skillsWanted: [{
    name: String,
    description: String,
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Beginner'
    }
  }],
  availability: {
    weekdays: { type: Boolean, default: false },
    weekends: { type: Boolean, default: false },
    evenings: { type: Boolean, default: false },
    mornings: { type: Boolean, default: false }
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  completedSwaps: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);