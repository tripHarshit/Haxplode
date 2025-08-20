const { Judge, JudgeEventAssignment, JudgeSubmissionAssignment, User, Event } = require('../models/sql');
const Submission = require('../models/mongo/Submission');
const { AnalyticsEvent } = require('../models/mongo');
const { emitToRoom } = require('../utils/socket');
const { audit } = require('../utils/audit');

// Assign judge to event (Organizer only)
const assignJudgeToEvent = async (req, res) => {
  try {
    const { judgeId, eventId, role = 'Secondary', email } = req.body;

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

    // Resolve judge by id or email
    let resolvedJudgeId = judgeId;
    if (!resolvedJudgeId && email) {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User with this email not found' });
      }
      // Ensure role is Judge
      if (user.role !== 'Judge') {
        // Optionally promote to Judge or create Judge profile
        await user.update({ role: 'Judge' });
      }
      // Ensure Judge profile exists
      let judgeProfile = await Judge.findOne({ where: { userId: user.id } });
      if (!judgeProfile) {
        // Provide defaults that satisfy model validation (expertise expects an array)
        judgeProfile = await Judge.create({ userId: user.id, expertise: [] });
      }
      resolvedJudgeId = judgeProfile.id;
    }

    // Check if judge exists by id
    const judge = await Judge.findByPk(resolvedJudgeId);
    if (!judge) {
      return res.status(404).json({ success: false, message: 'Judge not found' });
    }

    // Check if assignment already exists
    const existingAssignment = await JudgeEventAssignment.findOne({
      where: { judgeId: resolvedJudgeId, eventId },
    });

    if (existingAssignment) {
      return res.status(409).json({
        success: false,
        message: 'Judge is already assigned to this event',
      });
    }

    // Create assignment
    const assignment = await JudgeEventAssignment.create({
      judgeId: resolvedJudgeId,
      eventId,
      role,
    });

    audit(req.currentUser.id, 'judge_assigned', { eventId, metadata: { judgeId: resolvedJudgeId, role } });
    emitToRoom(`event:${eventId}`, 'judge_assignment', { judgeId: resolvedJudgeId, assignment: { eventId, role } });

    res.status(201).json({
      success: true,
      message: 'Judge assigned to event successfully',
      data: {
        assignment,
      },
    });
  } catch (error) {
    console.error('Assign judge to event error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    res.status(500).json({
      success: false,
      message: 'Failed to assign judge to event',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
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

          attributes: ['id', 'name', 'description', 'timeline'],

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

// Assign all submissions to all judges for an event (Organizer only)
const assignSubmissionsToJudges = async (req, res) => {
  try {
    console.log('🔍 [assignSubmissionsToJudges] Starting function');
    console.log('🔍 [assignSubmissionsToJudges] Request params:', req.params);
    console.log('🔍 [assignSubmissionsToJudges] Current user:', req.currentUser);
    
    const { eventId } = req.params;

    console.log('🔍 [assignSubmissionsToJudges] Event ID:', eventId);

    // Check if event exists
    console.log('🔍 [assignSubmissionsToJudges] Checking if event exists...');
    const event = await Event.findByPk(eventId);
    if (!event) {
      console.log('❌ [assignSubmissionsToJudges] Event not found');
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    console.log('🔍 [assignSubmissionsToJudges] Event found:', event.name);

    // Check if user is event creator or organizer
    if (event.createdBy !== req.currentUser.id && req.currentUser.role !== 'Organizer') {
      console.log('❌ [assignSubmissionsToJudges] Access denied - not event creator or organizer');
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only event creator or organizers can assign submissions.',
      });
    }

    // Get all judges assigned to this event
    console.log('🔍 [assignSubmissionsToJudges] Fetching judges assigned to event...');
    const judgeAssignments = await JudgeEventAssignment.findAll({
      where: { eventId, isActive: true },
      include: [{ model: Judge, as: 'judge' }],
    });

    console.log('🔍 [assignSubmissionsToJudges] Found judge assignments:', judgeAssignments.length);

    if (judgeAssignments.length === 0) {
      console.log('❌ [assignSubmissionsToJudges] No judges assigned to this event');
      return res.status(400).json({
        success: false,
        message: 'No judges assigned to this event',
      });
    }

    // Get all submissions for this event
    console.log('🔍 [assignSubmissionsToJudges] Fetching submissions for event...');
    const submissions = await Submission.find({ eventId });

    console.log('🔍 [assignSubmissionsToJudges] Found submissions:', submissions.length);

    if (submissions.length === 0) {
      console.log('❌ [assignSubmissionsToJudges] No submissions found for this event');
      return res.status(400).json({
        success: false,
        message: 'No submissions found for this event',
      });
    }

    // Assign each submission to each judge
    console.log('🔍 [assignSubmissionsToJudges] Starting assignment process...');
    const assignments = [];
    for (const submission of submissions) {
      console.log('🔍 [assignSubmissionsToJudges] Processing submission:', submission._id);
      for (const judgeAssignment of judgeAssignments) {
        console.log('🔍 [assignSubmissionsToJudges] Processing judge:', judgeAssignment.judgeId);
        
        // Check if assignment already exists
        const existingAssignment = await JudgeSubmissionAssignment.findOne({
          where: { judgeId: judgeAssignment.judgeId, submissionId: submission._id.toString() },
        });

        if (!existingAssignment) {
          console.log('🔍 [assignSubmissionsToJudges] Creating new assignment for judge', judgeAssignment.judgeId, 'and submission', submission._id);
          const assignment = await JudgeSubmissionAssignment.create({
            judgeId: judgeAssignment.judgeId,
            submissionId: submission._id.toString(),
            eventId,
            status: 'assigned',
          });
          assignments.push(assignment);
        } else {
          console.log('🔍 [assignSubmissionsToJudges] Assignment already exists for judge', judgeAssignment.judgeId, 'and submission', submission._id);
        }
      }
    }

    console.log('🔍 [assignSubmissionsToJudges] Created assignments:', assignments.length);

    audit(req.currentUser.id, 'submissions_assigned_to_judges', { 
      eventId, 
      metadata: { 
        submissionsCount: submissions.length, 
        judgesCount: judgeAssignments.length,
        assignmentsCount: assignments.length 
      } 
    });

    res.status(201).json({
      success: true,
      message: 'Submissions assigned to judges successfully',
      data: {
        assignments: assignments.length,
        submissions: submissions.length,
        judges: judgeAssignments.length,
      },
    });
  } catch (error) {
    console.error('❌ [assignSubmissionsToJudges] Error:', error);
    console.error('❌ [assignSubmissionsToJudges] Error stack:', error.stack);
    console.error('❌ [assignSubmissionsToJudges] Error message:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to assign submissions to judges',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Get assigned submissions for a judge
const getAssignedSubmissions = async (req, res) => {
  try {
    console.log('🔍 [getAssignedSubmissions] Starting function');
    console.log('🔍 [getAssignedSubmissions] Request params:', req.params);
    console.log('🔍 [getAssignedSubmissions] Current user:', req.currentUser);
    
    const judgeId = req.currentUser.judgeProfile?.id;
    const { eventId } = req.params;

    console.log('🔍 [getAssignedSubmissions] Judge ID:', judgeId);
    console.log('🔍 [getAssignedSubmissions] Event ID:', eventId);

    if (!judgeId) {
      console.log('❌ [getAssignedSubmissions] Judge profile not found');
      return res.status(404).json({
        success: false,
        message: 'Judge profile not found',
      });
    }

    // Check if judge is assigned to this event
    console.log('🔍 [getAssignedSubmissions] Checking judge event assignment...');
    let eventAssignment;
    try {
      eventAssignment = await JudgeEventAssignment.findOne({
        where: { judgeId, eventId, isActive: true },
      });
      console.log('🔍 [getAssignedSubmissions] Event assignment found:', !!eventAssignment);
    } catch (sqlError) {
      console.error('❌ [getAssignedSubmissions] SQL error checking event assignment:', sqlError);
      console.error('❌ [getAssignedSubmissions] SQL error stack:', sqlError.stack);
      return res.status(500).json({
        success: false,
        message: 'Failed to check judge assignment',
        error: process.env.NODE_ENV === 'development' ? sqlError.message : 'Internal server error',
      });
    }

    if (!eventAssignment) {
      console.log('❌ [getAssignedSubmissions] Judge not assigned to this event');
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this event',
      });
    }

    // Get all submission assignments for this judge and event
    console.log('🔍 [getAssignedSubmissions] Fetching submission assignments...');
    let submissionAssignments = [];
    try {
      submissionAssignments = await JudgeSubmissionAssignment.findAll({
        where: { judgeId, eventId },
        order: [['assignedAt', 'ASC']],
      });
      console.log('🔍 [getAssignedSubmissions] Found submission assignments:', submissionAssignments.length);
    } catch (sqlError) {
      console.error('❌ [getAssignedSubmissions] SQL error fetching submission assignments:', sqlError);
      console.error('❌ [getAssignedSubmissions] SQL error stack:', sqlError.stack);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch submission assignments',
        error: process.env.NODE_ENV === 'development' ? sqlError.message : 'Internal server error',
      });
    }

    // If no assignments exist for this judge & event, auto-assign all submissions for convenience
    if (!submissionAssignments || submissionAssignments.length === 0) {
      console.log('ℹ️ [getAssignedSubmissions] No assignments found. Auto-assigning all event submissions to judge', judgeId);
      let eventSubmissions = [];
      try {
        eventSubmissions = await Submission.find({ eventId });
        console.log('🔍 [getAssignedSubmissions] Submissions found in MongoDB for event:', eventSubmissions.length);
      } catch (mongoError) {
        console.error('❌ [getAssignedSubmissions] MongoDB error while fetching event submissions:', mongoError);
        return res.status(500).json({ success: false, message: 'Failed to fetch event submissions' });
      }

      const createPayload = eventSubmissions.map((s) => ({
        judgeId,
        submissionId: s._id.toString(),
        eventId,
        status: 'assigned',
        assignedAt: new Date(),
      }));
      try {
        // Bulk create but ignore duplicates just in case
        for (const payload of createPayload) {
          const exists = await JudgeSubmissionAssignment.findOne({ where: { judgeId, submissionId: payload.submissionId } });
          if (!exists) {
            await JudgeSubmissionAssignment.create(payload);
          }
        }
        console.log('✅ [getAssignedSubmissions] Auto-assignment complete:', createPayload.length);
      } catch (createErr) {
        console.error('❌ [getAssignedSubmissions] Failed auto-assigning submissions:', createErr.message);
      }
      // Reload assignments
      submissionAssignments = await JudgeSubmissionAssignment.findAll({
        where: { judgeId, eventId },
        order: [['assignedAt', 'ASC']],
      });
      console.log('🔍 [getAssignedSubmissions] Reloaded assignments:', submissionAssignments.length);
    }

    // Get submission details from MongoDB
    const submissionIds = submissionAssignments.map(assignment => assignment.submissionId);
    console.log('🔍 [getAssignedSubmissions] Submission IDs to fetch:', submissionIds);

    if (submissionIds.length === 0) {
      console.log('🔍 [getAssignedSubmissions] No submission assignments found, returning empty array');
      return res.status(200).json({
        success: true,
        data: {
          submissions: [],
        },
      });
    }

    console.log('🔍 [getAssignedSubmissions] Fetching submissions from MongoDB...');
    let submissions = [];
    try {
      submissions = await Submission.find({ _id: { $in: submissionIds } });
      console.log('🔍 [getAssignedSubmissions] Found submissions from MongoDB:', submissions.length);
    } catch (mongoError) {
      console.error('❌ [getAssignedSubmissions] MongoDB error:', mongoError);
      console.error('❌ [getAssignedSubmissions] MongoDB error stack:', mongoError.stack);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch submissions from database',
        error: process.env.NODE_ENV === 'development' ? mongoError.message : 'Internal server error',
      });
    }

    // Combine SQL and MongoDB data
    console.log('🔍 [getAssignedSubmissions] Combining data...');
    const submissionsWithStatus = submissions.map(submission => {
      const assignment = submissionAssignments.find(
        assignment => assignment.submissionId === submission._id.toString()
      );
      
      console.log('🔍 [getAssignedSubmissions] Processing submission:', submission._id, 'Assignment found:', !!assignment);
      
      return {
        ...submission.toObject(),
        assignmentId: assignment?.id,
        reviewStatus: assignment?.status || 'assigned',
        assignedAt: assignment?.assignedAt,
        reviewedAt: assignment?.reviewedAt,
        judgeScore: assignment?.score,
        judgeFeedback: assignment?.feedback,
        judgeCriteria: assignment?.criteria,
      };
    });

    console.log('🔍 [getAssignedSubmissions] Final submissions count:', submissionsWithStatus.length);

    res.status(200).json({
      success: true,
      data: {
        submissions: submissionsWithStatus,
      },
    });
  } catch (error) {
    console.error('❌ [getAssignedSubmissions] Error:', error);
    console.error('❌ [getAssignedSubmissions] Error stack:', error.stack);
    console.error('❌ [getAssignedSubmissions] Error message:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get assigned submissions',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Submit review for a submission (Judge only) - with locking mechanism
const submitReview = async (req, res) => {
  try {
    console.log('🔍 [submitReview] Starting function');
    console.log('🔍 [submitReview] Request body:', req.body);
    console.log('🔍 [submitReview] Current user:', req.currentUser);
    
    const { submissionId, score, feedback, criteria } = req.body;
    const judgeId = req.currentUser.judgeProfile?.id;

    console.log('🔍 [submitReview] Judge ID:', judgeId);
    console.log('🔍 [submitReview] Submission ID:', submissionId);
    console.log('🔍 [submitReview] Score:', score);

    if (!judgeId) {
      console.log('❌ [submitReview] Judge profile not found');
      return res.status(404).json({
        success: false,
        message: 'Judge profile not found',
      });
    }

    // Check if submission assignment exists and is not already reviewed
    console.log('🔍 [submitReview] Checking submission assignment...');
    const assignment = await JudgeSubmissionAssignment.findOne({
      where: { judgeId, submissionId, status: 'assigned' },
    });

    console.log('🔍 [submitReview] Assignment found:', !!assignment);

    if (!assignment) {
      console.log('❌ [submitReview] Submission not assigned to judge or already reviewed');
      return res.status(404).json({
        success: false,
        message: 'Submission not assigned to you or already reviewed',
      });
    }

    // Validate score
    if (typeof score !== 'number' || score < 0 || score > 100) {
      console.log('❌ [submitReview] Invalid score:', score);
      return res.status(400).json({
        success: false,
        message: 'Score must be between 0 and 100',
      });
    }

    // Update assignment to reviewed status (locking mechanism)
    console.log('🔍 [submitReview] Updating assignment to reviewed status...');
    await assignment.update({
      status: 'reviewed',
      score,
      feedback,
      criteria,
      reviewedAt: new Date(),
    });

    console.log('🔍 [submitReview] Assignment updated successfully');

    // Also add to MongoDB submission scores for backward compatibility
    console.log('🔍 [submitReview] Adding to MongoDB submission scores...');
    await Submission.findByIdAndUpdate(submissionId, {
      $push: {
        scores: {
          judgeId,
          score,
          feedback,
          criteria,
          submittedAt: new Date(),
        },
      },
    });

    console.log('🔍 [submitReview] MongoDB submission updated successfully');

    audit(req.currentUser.id, 'submission_reviewed', { 
      submissionId, 
      metadata: { judgeId, score, eventId: assignment.eventId } 
    });

    console.log('🔍 [submitReview] Audit log created');

    res.status(200).json({
      success: true,
      message: 'Review submitted successfully',
      data: {
        assignment,
      },
    });
  } catch (error) {
    console.error('❌ [submitReview] Error:', error);
    console.error('❌ [submitReview] Error stack:', error.stack);
    console.error('❌ [submitReview] Error message:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to submit review',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Get event results with average scores (Organizer only)
const getEventResults = async (req, res) => {
  try {
    console.log('🔍 [getEventResults] Starting function');
    console.log('🔍 [getEventResults] Request params:', req.params);
    console.log('🔍 [getEventResults] Current user:', req.currentUser);
    
    const { eventId } = req.params;

    console.log('🔍 [getEventResults] Event ID:', eventId);

    // Check if event exists
    console.log('🔍 [getEventResults] Checking if event exists...');
    const event = await Event.findByPk(eventId);
    if (!event) {
      console.log('❌ [getEventResults] Event not found');
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    console.log('🔍 [getEventResults] Event found:', event.name);

    // Check if user is event creator or organizer
    if (event.createdBy !== req.currentUser.id && req.currentUser.role !== 'Organizer') {
      console.log('❌ [getEventResults] Access denied - not event creator or organizer');
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only event creator or organizers can view results.',
      });
    }

    // Get all submission assignments for this event
    console.log('🔍 [getEventResults] Fetching submission assignments...');
    const submissionAssignments = await JudgeSubmissionAssignment.findAll({
      where: { eventId, status: 'reviewed' },
    });

    console.log('🔍 [getEventResults] Found reviewed submission assignments:', submissionAssignments.length);

    // Get submissions from MongoDB
    const submissionIds = [...new Set(submissionAssignments.map(assignment => assignment.submissionId))];
    console.log('🔍 [getEventResults] Unique submission IDs:', submissionIds.length);

    if (submissionIds.length === 0) {
      console.log('🔍 [getEventResults] No reviewed submissions found, returning empty array');
      return res.status(200).json({
        success: true,
        data: {
          submissions: [],
          totalSubmissions: 0,
          totalReviews: 0,
        },
      });
    }

    console.log('🔍 [getEventResults] Fetching submissions from MongoDB...');
    const submissions = await Submission.find({ _id: { $in: submissionIds } });
    console.log('🔍 [getEventResults] Found submissions from MongoDB:', submissions.length);

    // Calculate average scores for each submission
    console.log('🔍 [getEventResults] Calculating average scores...');
    const submissionsWithScores = submissions.map(submission => {
      const submissionAssignmentsForSubmission = submissionAssignments.filter(
        assignment => assignment.submissionId === submission._id.toString()
      );

      const totalScore = submissionAssignmentsForSubmission.reduce((sum, assignment) => sum + assignment.score, 0);
      const averageScore = submissionAssignmentsForSubmission.length > 0 
        ? totalScore / submissionAssignmentsForSubmission.length 
        : 0;

      console.log('🔍 [getEventResults] Submission', submission._id, 'has', submissionAssignmentsForSubmission.length, 'reviews, average score:', averageScore);

      return {
        ...submission.toObject(),
        averageScore: Math.round(averageScore * 100) / 100,
        totalReviews: submissionAssignmentsForSubmission.length,
        reviews: submissionAssignmentsForSubmission.map(assignment => ({
          judgeId: assignment.judgeId,
          score: assignment.score,
          feedback: assignment.feedback,
          reviewedAt: assignment.reviewedAt,
        })),
      };
    });

    // Sort by average score (descending)
    submissionsWithScores.sort((a, b) => b.averageScore - a.averageScore);

    console.log('🔍 [getEventResults] Final submissions count:', submissionsWithScores.length);

    res.status(200).json({
      success: true,
      data: {
        submissions: submissionsWithScores,
        totalSubmissions: submissions.length,
        totalReviews: submissionAssignments.length,
      },
    });
  } catch (error) {
    console.error('❌ [getEventResults] Error:', error);
    console.error('❌ [getEventResults] Error stack:', error.stack);
    console.error('❌ [getEventResults] Error message:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get event results',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
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
  assignSubmissionsToJudges,
  getAssignedSubmissions,
  submitReview,
  getEventResults,
};
