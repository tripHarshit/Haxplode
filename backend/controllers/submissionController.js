const Submission = require('../models/mongo/Submission');
const { Team, TeamMember } = require('../models/sql/Team');
const Event = require('../models/sql/Event');
const { audit } = require('../utils/audit');

// Create submission (Participant only)
const createSubmission = async (req, res) => {
  try {
    const {
      teamId,
      eventId,
      githubLink,
      docLink,
      videoLink,
      projectName,
      projectDescription,
      technologies,
      features,
      challenges,
      learnings,
      futurePlans,
    } = req.body;

    // Check if team exists and user is a member
    const team = await Team.findByPk(teamId, {
      include: [
        {
          model: TeamMember,
          as: 'members',
        },
      ],
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    // Check if user is team member
    const isMember = team.members.some(
      member => member.userId === req.currentUser.id
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this team',
      });
    }

    // Check if event exists and submissions are open
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    if (event.status !== 'In Progress') {
      return res.status(400).json({
        success: false,
        message: 'Event is not in progress. Submissions are not open.',
      });
    }

    // Enforce team-only/individual-only
    const eventSettings = event.settings || {};
    if (eventSettings.allowIndividual === false) {
      // must be in a team (already verified above), no extra action
    }
    if (eventSettings.allowTeams === false) {
      // individual only: forbid team submissions
      const memberCount = team.members.length;
      if (memberCount > 1) {
        return res.status(400).json({ success: false, message: 'This event does not allow team submissions' });
      }
    }

    // Check if submission already exists for this team and event
    const existingSubmission = await Submission.findOne({ teamId, eventId });
    if (existingSubmission) {
      return res.status(409).json({
        success: false,
        message: 'Submission already exists for this team and event',
      });
    }

    // Create submission
    const submission = await Submission.create({
      teamId,
      eventId,
      githubLink,
      docLink,
      videoLink,
      projectName,
      projectDescription,
      technologies,
      features,
      challenges,
      learnings,
      futurePlans,
      status: 'Submitted',
    });

    audit(req.currentUser.id, 'submission_created', { eventId, teamId, submissionId: submission._id });

    res.status(201).json({
      success: true,
      message: 'Submission created successfully',
      data: {
        submission,
      },
    });
  } catch (error) {
    console.error('Create submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create submission',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get submissions by event
const getSubmissionsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;

    const filter = { eventId };
    if (status) filter.status = status;

    // Get submissions with pagination
    const submissions = await Submission.find(filter)
      .sort({ submissionDate: -1 })
      .skip(offset)
      .limit(parseInt(limit));

    const totalCount = await Submission.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: {
        submissions,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: totalCount,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Get submissions by event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get submissions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get submission by ID
const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        submission,
      },
    });
  } catch (error) {
    console.error('Get submission by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get submission',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Update submission (Participant only)
const updateSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    // Check if user is team member
    const team = await Team.findByPk(submission.teamId, {
      include: [
        {
          model: TeamMember,
          as: 'members',
        },
      ],
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    const isMember = team.members.some(
      member => member.userId === req.currentUser.id
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this submission',
      });
    }

    // Check if event is still in progress
    const event = await Event.findByPk(submission.eventId);
    if (event.status !== 'In Progress') {
      return res.status(400).json({
        success: false,
        message: 'Event is not in progress. Submissions cannot be updated.',
      });
    }

    // Validate against event criteria if present
    if (event && Array.isArray(event.customCriteria) && req.body.criteriaScores) {
      const critIds = new Set(event.customCriteria.map(c => c.id));
      const invalid = Object.keys(req.body.criteriaScores).some(k => !critIds.has(k));
      if (invalid) {
        return res.status(400).json({ success: false, message: 'Invalid criteria keys' });
      }
    }

    // Update submission
    const updatedSubmission = await Submission.findByIdAndUpdate(
      id,
      { ...updateData, lastModified: new Date() },
      { new: true, runValidators: true }
    );

    audit(req.currentUser.id, 'submission_updated', { eventId: submission.eventId, teamId: submission.teamId, submissionId: submission._id });

    res.status(200).json({
      success: true,
      message: 'Submission updated successfully',
      data: {
        submission: updatedSubmission,
      },
    });
  } catch (error) {
    console.error('Update submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update submission',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get user's submissions
const getUserSubmissions = async (req, res) => {
  try {
    const userId = req.currentUser.id;

    // Get teams where user is a member
    const userTeams = await Team.findAll({
      include: [
        {
          model: TeamMember,
          as: 'members',
          where: { userId },
        },
      ],
    });

    const teamIds = userTeams.map(team => team.id);

    // Get submissions for user's teams
    const submissions = await Submission.find({
      teamId: { $in: teamIds },
    }).sort({ submissionDate: -1 });

    res.status(200).json({
      success: true,
      data: {
        submissions,
      },
    });
  } catch (error) {
    console.error('Get user submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user submissions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Change submission status (Organizer/Judge only)
const changeSubmissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    // Update submission status
    const updatedSubmission = await Submission.findByIdAndUpdate(
      id,
      { 
        status,
        submissionNotes: notes || submission.submissionNotes,
        lastModified: new Date(),
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Submission status updated successfully',
      data: {
        submission: updatedSubmission,
      },
    });
  } catch (error) {
    console.error('Change submission status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change submission status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  createSubmission,
  getSubmissionsByEvent,
  getSubmissionById,
  updateSubmission,
  getUserSubmissions,
  changeSubmissionStatus,
};
