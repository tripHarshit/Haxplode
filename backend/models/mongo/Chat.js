const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  eventId: {
    type: Number,
    required: [true, 'Event ID is required'],
    ref: 'Event',
  },
  senderId: {
    type: Number,
    required: [true, 'Sender ID is required'],
    ref: 'User',
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters'],
  },
  messageType: {
    type: String,
    enum: ['Text', 'Question', 'Answer', 'Announcement', 'File'],
    default: 'Text',
  },
  isQuestion: {
    type: Boolean,
    default: false,
  },
  parentMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    default: null,
  },
  isAnswered: {
    type: Boolean,
    default: false,
  },
  answeredBy: {
    type: Number,
    ref: 'User',
  },
  answeredAt: {
    type: Date,
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return v.length <= 5;
      },
      message: 'Cannot exceed 5 tags',
    },
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
  reactions: {
    type: [{
      userId: Number,
      type: {
        type: String,
        enum: ['Like', 'Love', 'Haha', 'Wow', 'Sad', 'Angry'],
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    default: [],
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
  editedAt: {
    type: Date,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
  },
  deletedBy: {
    type: Number,
    ref: 'User',
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  pinnedBy: {
    type: Number,
    ref: 'User',
  },
  pinnedAt: {
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
  mentions: {
    type: [{
      userId: Number,
      username: String,
      mentionedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    default: [],
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better query performance
chatSchema.index({ eventId: 1, createdAt: -1 });
chatSchema.index({ eventId: 1, senderId: 1 });
chatSchema.index({ eventId: 1, isQuestion: 1 });
chatSchema.index({ eventId: 1, parentMessageId: 1 });
chatSchema.index({ eventId: 1, isPinned: 1 });
chatSchema.index({ parentMessageId: 1 });
chatSchema.index({ message: 'text' });

// Virtual for message age
chatSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for reaction count
chatSchema.virtual('reactionCount').get(function() {
  return this.reactions.length;
});

// Virtual for read count
chatSchema.virtual('readCount').get(function() {
  return this.readBy.length;
});

// Pre-save middleware to handle question/answer logic
chatSchema.pre('save', function(next) {
  if (this.messageType === 'Question') {
    this.isQuestion = true;
  }
  
  if (this.messageType === 'Answer' && this.parentMessageId) {
    this.isQuestion = false;
  }
  
  next();
});

// Static method to find questions for an event
chatSchema.statics.findQuestionsByEvent = function(eventId) {
  return this.find({
    eventId,
    isQuestion: true,
    isDeleted: false,
  }).sort({ createdAt: -1 });
};

// Static method to find answers for a question
chatSchema.statics.findAnswersForQuestion = function(questionId) {
  return this.find({
    parentMessageId: questionId,
    isDeleted: false,
  }).sort({ createdAt: 1 });
};

// Static method to find recent messages for an event
chatSchema.statics.findRecentByEvent = function(eventId, limit = 50) {
  return this.find({
    eventId,
    isDeleted: false,
  }).sort({ createdAt: -1 }).limit(limit);
};

// Instance method to add reaction
chatSchema.methods.addReaction = function(userId, reactionType) {
  const existingReaction = this.reactions.find(r => r.userId === userId);
  if (existingReaction) {
    existingReaction.type = reactionType;
    existingReaction.createdAt = new Date();
  } else {
    this.reactions.push({ userId, type: reactionType });
  }
  return this.save();
};

// Instance method to remove reaction
chatSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(r => r.userId !== userId);
  return this.save();
};

// Instance method to mark as read by user
chatSchema.methods.markAsRead = function(userId) {
  const existingRead = this.readBy.find(read => read.userId === userId);
  if (!existingRead) {
    this.readBy.push({ userId, readAt: new Date() });
  }
  return this.save();
};

// Instance method to mark question as answered
chatSchema.methods.markAsAnswered = function(answeredBy) {
  this.isAnswered = true;
  this.answeredBy = answeredBy;
  this.answeredAt = new Date();
  return this.save();
};

// Instance method to pin/unpin message
chatSchema.methods.togglePin = function(userId) {
  this.isPinned = !this.isPinned;
  if (this.isPinned) {
    this.pinnedBy = userId;
    this.pinnedAt = new Date();
  } else {
    this.pinnedBy = undefined;
    this.pinnedAt = undefined;
  }
  return this.save();
};

module.exports = mongoose.model('Chat', chatSchema);
