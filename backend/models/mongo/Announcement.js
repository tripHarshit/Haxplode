const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  eventId: {
    type: Number,
    required: [true, 'Event ID is required'],
    ref: 'Event',
  },
  organizerId: {
    type: Number,
    required: [true, 'Organizer ID is required'],
    ref: 'User',
  },
  title: {
    type: String,
    required: [true, 'Announcement title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  message: {
    type: String,
    required: [true, 'Announcement message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters'],
  },
  // New field to match organizer UI visibility selection
  visibility: {
    type: String,
    enum: ['Participants', 'Judges', 'Both'],
    default: 'Participants',
  },
  type: {
    type: String,
    enum: ['General', 'Important', 'Urgent', 'Update', 'Reminder'],
    default: 'General',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  targetAudience: {
    type: [String],
    enum: ['All', 'Participants', 'Organizers', 'Judges', 'Teams'],
    default: ['All'],
  },
  attachments: {
    type: [{
      name: String,
      url: String,
      type: String,
      size: Number,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    default: [],
  },
  scheduledFor: {
    type: Date,
  },
  expiresAt: {
    type: Date,
  },
  readBy: {
    type: [{
      userId: Number,
      readAt: {
        type: Date,
        default: Date.now,
      },
    }],
    default: [],
  },
  tags: {
    type: [String],
    enum: ['important', 'urgent', 'mandatory'],
    default: [],
    validate: {
      validator: function(v) {
        return v.length <= 10;
      },
      message: 'Cannot exceed 10 tags',
    },
  },
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Scheduled', 'Expired', 'Archived'],
    default: 'Draft',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better query performance
announcementSchema.index({ eventId: 1, createdAt: -1 });
announcementSchema.index({ eventId: 1, type: 1 });
announcementSchema.index({ eventId: 1, priority: 1 });
announcementSchema.index({ eventId: 1, isPinned: 1 });
announcementSchema.index({ scheduledFor: 1 });
announcementSchema.index({ expiresAt: 1 });
announcementSchema.index({ title: 'text', message: 'text' });

// Virtual for announcement age
announcementSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for read count
announcementSchema.virtual('readCount').get(function() {
  return this.readBy.length;
});

// Pre-save middleware to handle scheduling
announcementSchema.pre('save', function(next) {
  if (this.scheduledFor && this.scheduledFor > new Date()) {
    this.status = 'Scheduled';
  } else if (this.status === 'Scheduled' && this.scheduledFor <= new Date()) {
    this.status = 'Published';
  }
  
  if (this.expiresAt && this.expiresAt <= new Date()) {
    this.status = 'Expired';
  }
  
  next();
});

// Static method to find active announcements for an event
announcementSchema.statics.findActiveByEvent = function(eventId) {
  return this.find({
    eventId,
    status: { $in: ['Published', 'Scheduled'] },
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  }).sort({ isPinned: -1, priority: -1, createdAt: -1 });
};

// Static method to find pinned announcements
announcementSchema.statics.findPinnedByEvent = function(eventId) {
  return this.find({
    eventId,
    isPinned: true,
    status: 'Published'
  }).sort({ priority: -1, createdAt: -1 });
};

// Instance method to mark as read by user
announcementSchema.methods.markAsRead = function(userId) {
  const existingRead = this.readBy.find(read => read.userId === userId);
  if (!existingRead) {
    this.readBy.push({ userId, readAt: new Date() });
  }
  return this.save();
};

// Instance method to check if user has read
announcementSchema.methods.isReadBy = function(userId) {
  return this.readBy.some(read => read.userId === userId);
};

module.exports = mongoose.model('Announcement', announcementSchema);
