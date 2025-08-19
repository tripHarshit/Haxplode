const { Judge, JudgeEventAssignment } = require('../models/sql/Judge');
const User = require('../models/sql/User');
const Event = require('../models/sql/Event');
const Submission = require('../models/mongo/Submission');
const { AnalyticsEvent } = require('../models/mongo');
const { emitToRoom } = require('../utils/socket');
const { audit } = require('../utils/audit');

// Assign judge to event (Organizer only)
const assignJudgeToEvent = async (req, res) => {
  try {
    const { judgeId, eventId, role = 'Secondary' } = req.body;

    // Check if event exists
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if user is event creator or organizer
    if (event.createdBy !== req.currentUser.id && req.currentUser.role !== 'Organizer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only event creator or organizers can assign judges.',
      });
    }

    // Check if judge exists
    const judge = await Judge.findByPk(judgeId);
    if (!judge) {
      return res.status(404).json({
        success: false,
        message: 'Judge not found',
      });
    }

    // Check if assignment already exists
    const existingAssignment = await JudgeEventAssignment.findOne({
      where: { judgeId, eventId },
    });

    if (existingAssignment) {
      return res.status(409).json({
        success: false,
        message: 'Judge is already assigned to this event',
      });
    }

    // Create assignment
    const assignment = await JudgeEventAssignment.create({
      judgeId,
      eventId,
      role,
    });

    audit(req.currentUser.id, 'judge_assigned', { eventId, metadata: { judgeId, role } });
    emitToRoom(`event:${eventId}`, 'judge_assignment', { judgeId, assignment: { eventId, role } });

    res.status(201).json({
      success: true,
      message: 'Judge assigned to event successfully',
      data: {
        assignment,
      },
    });
  } catch (error) {
    console.error('Assign judge to event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign judge to event',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Remove judge from event (Organizer only)
const removeJudgeFromEvent = async (req, res) => {
  try {
    const { judgeId, eventId } = req.params;

    // Check if event exists
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if user is event creator or organizer
    if (event.createdBy !== req.currentUser.id && req.currentUser.role !== 'Organizer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only event creator or organizers can remove judges.',
      });
    }

    // Remove assignment
    await JudgeEventAssignment.destroy({
      where: { judgeId, eventId },
    });

    audit(req.currentUser.id, 'judge_removed', { eventId, metadata: { judgeId } });

    res.status(200).json({
      success: true,
      message: 'Judge removed from event successfully',
    });
  } catch (error) {
    console.error('Remove judge from event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove judge from event',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get judges for an event
const getJudgesByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const judges = await JudgeEventAssignment.findAll({
      where: { eventId, isActive: true },
      include: [
        {
          model: Judge,
          as: 'judge',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'fullName', 'email', 'role'],
            },
          ],
        },
      ],
      order: [['role', 'ASC'], ['assignedAt', 'ASC']],
    });

    res.status(200).json({
      success: true,
      data: {
        judges,
      },
    });
  } catch (error) {
    console.error('Get judges by event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get judges',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get judge's assigned events
const getJudgeEvents = async (req, res) => {
  try {
    const judgeId = req.currentUser.judgeProfile?.id;

    if (!judgeId) {
      return res.status(404).json({
        success: false,
        message: 'Judge profile not found',
      });
    }

    const assignments = await JudgeEventAssignment.findAll({
      where: { judgeId, isActive: true },
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'name', 'status', 'theme', 'startDate', 'endDate'],
        },
      ],
      order: [['assignedAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: {
        assignments,
      },
    });
  } catch (error) {
    console.error('Get judge events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get judge events',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Submit score for submission (Judge only)
const submitScore = async (req, res) => {
  try {
    const { submissionId, score, feedback, criteria } = req.body;
    const judgeId = req.currentUser.judgeProfile?.id;

    if (!judgeId) {
      return res.status(404).json({
        success: false,
        message: 'Judge profile not found',
      });
    }

    // Check if submission exists
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    // Check if judge is assigned to the event
    const assignment = await JudgeEventAssignment.findOne({
      where: { judgeId, eventId: submission.eventId, isActive: true },
    });

    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to judge this event',
      });
    }

    // Validate score
    if (score < 0 || score > 100) {
      return res.status(400).json({
        success: false,
        message: 'Score must be between 0 and 100',
      });
    }

    // Create or update score
    // Note: You might want to create a separate Score model for this
    // For now, we'll add it to the submission
    const updatedSubmission = await Submission.findByIdAndUpdate(
      submissionId,
      {
        $push: {
          scores: {
            judgeId,
            score,
            feedback,
            criteria,
            submittedAt: new Date(),
          },
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Score submitted successfully',
      data: {
        submission: updatedSubmission,
      },
    });
  } catch (error) {
    console.error('Submit score error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit score',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get scores for an event (Organizer only)
const getEventScores = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Check if user is event creator or organizer
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    if (event.createdBy !== req.currentUser.id && req.currentUser.role !== 'Organizer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only event creator or organizers can view scores.',
      });
    }

    // Get submissions with scores
    const submissions = await Submission.find({ eventId }).populate('scores');

    // Calculate average scores
    const submissionsWithScores = submissions.map(submission => {
      const scores = submission.scores || [];
      const averageScore = scores.length > 0 
        ? scores.reduce((sum, score) => sum + score.score, 0) / scores.length 
        : 0;

      return {
        ...submission.toObject(),
        averageScore: Math.round(averageScore * 100) / 100,
        totalScores: scores.length,
      };
    });

    // Sort by average score (descending)
    submissionsWithScores.sort((a, b) => b.averageScore - a.averageScore);

    res.status(200).json({
      success: true,
      data: {
        submissions: submissionsWithScores,
      },
    });
  } catch (error) {
    console.error('Get event scores error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get event scores',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get judge profile
const getJudgeProfile = async (req, res) => {
  try {
    const judgeId = req.currentUser.judgeProfile?.id;

    if (!judgeId) {
      return res.status(404).json({
        success: false,
        message: 'Judge profile not found',
      });
    }

    const judge = await Judge.findByPk(judgeId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'email', 'role'],
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: {
        judge,
      },
    });
  } catch (error) {
    console.error('Get judge profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get judge profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Update judge profile
const updateJudgeProfile = async (req, res) => {
  try {
    const { expertise, bio, yearsOfExperience, company, position, linkedinProfile, githubProfile } = req.body;
    const judgeId = req.currentUser.judgeProfile?.id;

    if (!judgeId) {
      return res.status(404).json({
        success: false,
        message: 'Judge profile not found',
      });
    }

    const judge = await Judge.findByPk(judgeId);
    if (!judge) {
      return res.status(404).json({
        success: false,
        message: 'Judge profile not found',
      });
    }

    // Update judge profile
    await judge.update({
      expertise,
      bio,
      yearsOfExperience,
      company,
      position,
      linkedinProfile,
      githubProfile,
    });

    res.status(200).json({
      success: true,
      message: 'Judge profile updated successfully',
      data: {
        judge,
      },
    });
  } catch (error) {
    console.error('Update judge profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update judge profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Judge analytics (basic)
const getJudgeAnalytics = async (req, res) => {
  try {
    const judgeId = req.currentUser.judgeProfile?.id;
    if (!judgeId) {
      return res.status(404).json({ success: false, message: 'Judge profile not found' });
    }
    const countAgg = await Submission.aggregate([
      { $unwind: { path: '$scores', preserveNullAndEmptyArrays: false } },
      { $match: { 'scores.judgeId': judgeId } },
      { $group: { _id: null, total: { $sum: 1 }, avgScore: { $avg: '$scores.score' } } },
    ]);
    const totals = countAgg[0] || { total: 0, avgScore: 0 };
    const recent = await AnalyticsEvent.find({ userId: req.currentUser.id }).sort({ ts: -1 }).limit(20);
    return res.json({
      totals: { reviews: totals.total, averageScore: Math.round((totals.avgScore || 0) * 100) / 100 },
      recent,
    });
  } catch (error) {
    console.error('Judge analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch judge analytics' });
  }
};

module.exports = {
  assignJudgeToEvent,
  removeJudgeFromEvent,
  getJudgesByEvent,
  getJudgeEvents,
  submitScore,
  getEventScores,
  getJudgeProfile,
  updateJudgeProfile,
  getJudgeAnalytics,
};
