const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  teamId: {
    type: Number,
    required: [true, 'Team ID is required'],
    ref: 'Team',
  },
  eventId: {
    type: Number,
    required: [true, 'Event ID is required'],
    ref: 'Event',
  },
  githubLink: {
    type: String,
    required: [true, 'GitHub repository link is required'],
    validate: {
      validator: function(v) {
        return /^https:\/\/github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-._]+$/.test(v);
      },
      message: 'Please provide a valid GitHub repository URL',
    },
  },
  docLink: {
    type: String,
    required: [true, 'Documentation link is required'],
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Please provide a valid documentation URL',
    },
  },
  videoLink: {
    type: String,
    required: [true, 'Video link is required'],
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Please provide a valid video URL',
    },
  },
  projectName: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [200, 'Project name cannot exceed 200 characters'],
  },
  projectDescription: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    maxlength: [2000, 'Project description cannot exceed 2000 characters'],
  },
  technologies: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return v.length <= 20;
      },
      message: 'Cannot exceed 20 technologies',
    },
  },
  features: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return v.length <= 50;
      },
      message: 'Cannot exceed 50 features',
    },
  },
  challenges: {
    type: String,
    trim: true,
    maxlength: [1000, 'Challenges description cannot exceed 1000 characters'],
  },
  learnings: {
    type: String,
    trim: true,
    maxlength: [1000, 'Learnings description cannot exceed 1000 characters'],
  },
  futurePlans: {
    type: String,
    trim: true,
    maxlength: [1000, 'Future plans description cannot exceed 1000 characters'],
  },
  submissionDate: {
    type: Date,
    default: Date.now,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected'],
    default: 'Draft',
  },
  isLateSubmission: {
    type: Boolean,
    default: false,
  },
  submissionNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Submission notes cannot exceed 500 characters'],
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
  scores: {
    type: [{
      judgeId: Number,
      roundId: String,
      score: Number,
      feedback: String,
      criteria: Object,
      submittedAt: { type: Date, default: Date.now },
    }],
    default: [],
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better query performance
submissionSchema.index({ teamId: 1, eventId: 1 }, { unique: true });
submissionSchema.index({ eventId: 1, status: 1 });
submissionSchema.index({ submissionDate: -1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ projectName: 'text', projectDescription: 'text', technologies: 'text' });

// Virtual for submission age
submissionSchema.virtual('submissionAge').get(function() {
  return Math.floor((Date.now() - this.submissionDate) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to update lastModified
submissionSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

// Static method to find submissions by event
submissionSchema.statics.findByEvent = function(eventId) {
  return this.find({ eventId }).sort({ submissionDate: -1 });
};

// Static method to find submissions by team
submissionSchema.statics.findByTeam = function(teamId) {
  return this.find({ teamId }).sort({ submissionDate: -1 });
};

// Instance method to check if submission is late
submissionSchema.methods.isLate = function() {
  // This would need to be implemented based on event deadline
  return false;
};

module.exports = mongoose.model('Submission', submissionSchema);
