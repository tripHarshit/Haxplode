const { Op } = require('sequelize');
const { Event, User, Team, TeamMember, Judge, JudgeEventAssignment } = require('../models/sql');
const { Submission, Registration, Announcement } = require('../models/mongo');
const { emitToRoom } = require('../utils/socket');
const { audit } = require('../utils/audit');

// Map frontend filters to SQL columns
function buildEventFilters(query) {
	const { category, status, q, isOnline, tags } = query;
	const where = {};
	if (category) where.theme = category; // using theme as category analogue
	if (status) where.status = status;
	if (isOnline !== undefined) where.isVirtual = isOnline === 'true';
	if (q) {
		where[Op.or] = [
			{ name: { [Op.iLike]: `%${q}%` } },
			{ theme: { [Op.iLike]: `%${q}%` } },
			{ description: { [Op.iLike]: `%${q}%` } },
		];
	}
	if (tags) {
		const tagArray = tags.split(',').map(t => t.trim());
		where.tags = { [Op.overlap]: tagArray };
	}
	return where;
}

// GET /hackathons
async function listHackathons(req, res) {
	try {
		const { cursor, limit = 10 } = req.query;
		const where = buildEventFilters(req.query);
		const options = {
			where,
			order: [['createdAt', 'DESC']],
			limit: parseInt(limit),
			include: [{ model: User, as: 'creator', attributes: ['id', 'fullName'] }],
		};
		if (cursor) {
			options.where.id = { [Op.lt]: parseInt(cursor) };
		}
		const events = await Event.findAll(options);
		const nextCursor = events.length === parseInt(limit) ? events[events.length - 1].id : null;
		return res.json({ events, nextCursor });
	} catch (err) {
		console.error('List hackathons error:', err);
		return res.status(500).json({ message: 'Failed to fetch hackathons' });
	}
}

// GET /hackathons/:id
async function getHackathon(req, res) {
	try {
		const event = await Event.findByPk(req.params.id, {
			include: [
				{ model: User, as: 'creator', attributes: ['id', 'fullName'] },
				{ model: Team, as: 'teams', attributes: ['id', 'teamName', 'status'] },
			],
		});
		if (!event) return res.status(404).json({ message: 'Hackathon not found' });
		return res.json({ event });
	} catch (err) {
		console.error('Get hackathon error:', err);
		return res.status(500).json({ message: 'Failed to fetch hackathon' });
	}
}

// POST /hackathons
async function createHackathon(req, res) {
	try {
		console.log('=== HACKATHON CREATION STARTED ===');
		console.log('Request body:', JSON.stringify(req.body, null, 2));
		console.log('Current user ID:', req.currentUser.id);
		console.log('Current user role:', req.currentUser.role);
		
		const creatorId = req.currentUser.id;
		const {
			title,
			description,
			category,
			startDate,
			endDate,
			registrationDeadline,
			maxParticipants,
			isOnline,
			location,
			rules = [],
			timeline = {},
			prizes = [],
			sponsors = [],
			rounds = [],
			customCriteria = [],
			tags = [],
			settings = {},
		} = req.body;
		
		console.log('Extracted hackathon data:');
		console.log('- Title:', title);
		console.log('- Category:', category);
		console.log('- Description length:', description ? description.length : 'NULL');
		console.log('- Start date:', startDate);
		console.log('- End date:', endDate);
		console.log('- Max participants:', maxParticipants);
		console.log('- Is online:', isOnline);
		console.log('- Location:', location);

		console.log('About to create hackathon in database...');
		console.log('Event data to be created:');
		console.log('- Name:', title);
		console.log('- Theme:', category || 'General');
		console.log('- Description:', description);
		console.log('- Max team size:', settings.teamSizeMax || 4);
		console.log('- Max teams:', Math.ceil((maxParticipants || 100) / (settings.teamSizeMax || 4)));
		console.log('- Is public:', true);
		console.log('- Location:', location);
		console.log('- Is virtual:', !!isOnline);
		console.log('- Created by:', creatorId);
		
		// Prepare timeline data with proper validation
		const timelineData = timeline.startDate && timeline.endDate && timeline.registrationDeadline ? timeline : {
			startDate: startDate || new Date(),
			endDate: endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
			registrationDeadline: registrationDeadline || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
		};
		
		// Prepare prizes array (Event model requires non-empty array)
		const prizesArray = prizes && prizes.length > 0 ? prizes : ['TBD'];
		
		console.log('Timeline data:', timelineData);
		console.log('Prizes array:', prizesArray);
		
		const event = await Event.create({
			name: title,
			theme: category || 'General',
			description: description || 'No description provided',
			rules: rules.length > 0 ? rules.join('\n') : 'Standard hackathon rules apply',
			timeline: timelineData,
			prizes: prizesArray,
			sponsors: sponsors || [],
			tracks: req.body.tracks || [],
			rounds: rounds || [],
			customCriteria: customCriteria || [],
			settings: settings || {},
			maxTeamSize: settings.teamSizeMax || 4,
			maxTeams: Math.ceil((maxParticipants || 100) / (settings.teamSizeMax || 4)),
			isPublic: true,
			status: 'Published',
			tags: tags || [],
			coverImage: req.body.bannerUrl || null,
			location: location || 'TBD',
			isVirtual: !!isOnline,
			createdBy: creatorId,
		});

		console.log('Hackathon created successfully in database:');
		console.log('- Event ID:', event.id);
		console.log('- Event name:', event.name);
		console.log('- Created at:', event.createdAt);
		console.log('- Status:', event.status);
		
		audit(creatorId, 'event_created', { eventId: event.id });
		emitToRoom(`event:${event.id}`, 'event_announcement', { eventId: event.id, type: 'announcement', message: 'Event created', timestamp: new Date().toISOString() });
		
		console.log('Sending success response...');
		return res.status(201).json({ event });
	} catch (err) {
		console.error('=== HACKATHON CREATION FAILED ===');
		console.error('Error details:', err);
		console.error('Error message:', err.message);
		console.error('Error stack:', err.stack);
		return res.status(500).json({ message: 'Failed to create hackathon' });
	}
}

// PUT /hackathons/:id
async function updateHackathon(req, res) {
	try {
		const event = await Event.findByPk(req.params.id);
		if (!event) return res.status(404).json({ message: 'Hackathon not found' });
		if (event.createdBy !== req.currentUser.id && req.currentUser.role !== 'Organizer') {
			return res.status(403).json({ message: 'Forbidden' });
		}
		const payload = req.body;
		await event.update({
			name: payload.title ?? event.name,
			theme: payload.category ?? event.theme,
			description: payload.description ?? event.description,
			rules: payload.rules ? payload.rules.join('\n') : event.rules,
			timeline: payload.timeline || event.timeline,
			prizes: payload.prizes || event.prizes,
			sponsors: payload.sponsors ?? event.sponsors,
			tracks: payload.tracks ?? event.tracks,
			rounds: payload.rounds ?? event.rounds,
			customCriteria: payload.customCriteria ?? event.customCriteria,
			settings: payload.settings ?? event.settings,
			tags: payload.tags ?? event.tags,
			coverImage: payload.bannerUrl ?? event.coverImage,
			location: payload.location ?? event.location,
			isVirtual: payload.isOnline ?? event.isVirtual,
		});
		audit(req.currentUser.id, 'event_updated', { eventId: event.id });
		emitToRoom(`event:${event.id}`, 'event_announcement', { eventId: event.id, type: 'announcement', message: 'Event updated', timestamp: new Date().toISOString() });
		return res.json({ event });
	} catch (err) {
		console.error('Update hackathon error:', err);
		return res.status(500).json({ message: 'Failed to update hackathon' });
	}
}

// DELETE /hackathons/:id
async function deleteHackathon(req, res) {
	try {
		console.log('Delete hackathon request:', { eventId: req.params.id, userId: req.currentUser.id, userRole: req.currentUser.role });
		
		const event = await Event.findByPk(req.params.id);
		if (!event) {
			console.log('Event not found:', req.params.id);
			return res.status(404).json({ message: 'Hackathon not found' });
		}
		
		console.log('Found event:', { id: event.id, name: event.name, createdBy: event.createdBy });
		
		if (event.createdBy !== req.currentUser.id && req.currentUser.role !== 'Organizer') {
			console.log('Access denied:', { eventCreator: event.createdBy, currentUser: req.currentUser.id, userRole: req.currentUser.role });
			return res.status(403).json({ message: 'Forbidden' });
		}
		
		// Get all dependencies for cascade deletion
		const { Team, JudgeEventAssignment } = require('../models/sql');
		const { Registration, Chat, AnalyticsEvent, TeamInvitation, FileMeta, Announcement, Submission } = require('../models/mongo');
		
		console.log('Starting cascade deletion of all event dependencies...');
		
		// Delete SQL dependencies first (due to foreign key constraints)
		let teamCount = 0;
		let judgeAssignmentCount = 0;
		
		try {
			// Delete judge assignments
			judgeAssignmentCount = await JudgeEventAssignment.count({ where: { eventId: req.params.id } });
			if (judgeAssignmentCount > 0) {
				console.log(`Deleting ${judgeAssignmentCount} judge assignments...`);
				await JudgeEventAssignment.destroy({ where: { eventId: req.params.id } });
			}
			
			// Get team IDs first, then delete team members, then teams
			const teams = await Team.findAll({ where: { eventId: req.params.id }, attributes: ['id'] });
			teamCount = teams.length;
			
			if (teamCount > 0) {
				console.log(`Found ${teamCount} teams, deleting team members first...`);
				const teamIds = teams.map(t => t.id);
				
				// Delete team members
				const { TeamMember } = require('../models/sql');
				const teamMemberCount = await TeamMember.count({ where: { teamId: { [require('sequelize').Op.in]: teamIds } } });
				if (teamMemberCount > 0) {
					console.log(`Deleting ${teamMemberCount} team members...`);
					await TeamMember.destroy({ where: { teamId: { [require('sequelize').Op.in]: teamIds } } });
				}
				
				// Delete teams
				console.log(`Deleting ${teamCount} teams...`);
				await Team.destroy({ where: { eventId: req.params.id } });
			}
		} catch (sqlErr) {
			console.error('Failed to delete SQL dependencies:', sqlErr);
			console.error('SQL Error details:', {
				message: sqlErr.message,
				stack: sqlErr.stack,
				sql: sqlErr.sql
			});
			return res.status(500).json({ message: 'Failed to delete hackathon dependencies', error: sqlErr.message });
		}
		
		// Delete MongoDB dependencies
		try {
			const eventId = parseInt(req.params.id);
			
			// Delete registrations
			const registrationCount = await Registration.countDocuments({ eventId });
			if (registrationCount > 0) {
				console.log(`Deleting ${registrationCount} registrations...`);
				await Registration.deleteMany({ eventId });
			}
			
			// Delete submissions
			const submissionCount = await Submission.countDocuments({ eventId });
			if (submissionCount > 0) {
				console.log(`Deleting ${submissionCount} submissions...`);
				await Submission.deleteMany({ eventId });
			}
			
			// Delete other dependencies
			const chatCount = await Chat.countDocuments({ eventId });
			if (chatCount > 0) {
				console.log(`Deleting ${chatCount} chat messages...`);
				await Chat.deleteMany({ eventId });
			}
			
			const announcementCount = await Announcement.countDocuments({ eventId });
			if (announcementCount > 0) {
				console.log(`Deleting ${announcementCount} announcements...`);
				await Announcement.deleteMany({ eventId });
			}
			
			const teamInvitationCount = await TeamInvitation.countDocuments({ eventId });
			if (teamInvitationCount > 0) {
				console.log(`Deleting ${teamInvitationCount} team invitations...`);
				await TeamInvitation.deleteMany({ eventId });
			}
			
			const fileMetaCount = await FileMeta.countDocuments({ eventId });
			if (fileMetaCount > 0) {
				console.log(`Deleting ${fileMetaCount} file metadata...`);
				await FileMeta.deleteMany({ eventId });
			}
			
			const analyticsCount = await AnalyticsEvent.countDocuments({ eventId });
			if (analyticsCount > 0) {
				console.log(`Deleting ${analyticsCount} analytics events...`);
				await AnalyticsEvent.deleteMany({ eventId });
			}
			
			console.log(`Cascade deletion completed: ${teamCount} teams, ${judgeAssignmentCount} judge assignments, ${registrationCount} registrations, ${submissionCount} submissions, ${chatCount} chats, ${announcementCount} announcements, ${teamInvitationCount} team invitations, ${fileMetaCount} file metadata, ${analyticsCount} analytics events`);
		} catch (mongoErr) {
			console.error('Failed to delete MongoDB dependencies:', mongoErr);
			console.error('MongoDB Error details:', {
				message: mongoErr.message,
				stack: mongoErr.stack,
				code: mongoErr.code
			});
			return res.status(500).json({ message: 'Failed to delete hackathon dependencies', error: mongoErr.message });
		}
		
		console.log('All dependencies removed, proceeding with event deletion...');
		await event.destroy();
		console.log('Event deleted successfully');
		

		
		try {
			audit(req.currentUser.id, 'event_deleted', { eventId: event.id });
		} catch (auditErr) {
			console.warn('Audit failed:', auditErr.message);
		}
		try {
			emitToRoom(`event:${event.id}`, 'event_announcement', { eventId: event.id, type: 'announcement', message: 'Event deleted', timestamp: new Date().toISOString() });
		} catch (socketErr) {
			console.warn('Socket emit failed:', socketErr.message);
		}
		
		return res.json({ ok: true });
	} catch (err) {
		console.error('Delete hackathon error:', err);
		console.error('Error stack:', err.stack);
		return res.status(500).json({ message: 'Failed to delete hackathon', error: err.message });
	}
}

// POST /hackathons/:id/register
async function registerForHackathon(req, res) {
	try {
		const eventId = parseInt(req.params.id);
		const userId = req.currentUser.id;
		await Registration.findOneAndUpdate(
			{ eventId, userId },
			{ $setOnInsert: { status: 'confirmed', registeredAt: new Date() } },
			{ upsert: true, new: true }
		);
		audit(userId, 'event_registered', { eventId });
		return res.status(201).json({ message: 'Registered' });
	} catch (err) {
		console.error('Register error:', err);
		return res.status(500).json({ message: 'Failed to register' });
	}
}

// DELETE /hackathons/:id/register
async function unregisterFromHackathon(req, res) {
	try {
		const eventId = parseInt(req.params.id);
		const userId = req.currentUser.id;
		await Registration.deleteOne({ eventId, userId });
		audit(userId, 'event_unregistered', { eventId });
		return res.json({ ok: true });
	} catch (err) {
		console.error('Unregister error:', err);
		return res.status(500).json({ message: 'Failed to unregister' });
	}
}

// GET /hackathons/:id/participants
async function getParticipants(req, res) {
	try {
		const eventId = parseInt(req.params.id);
		const regs = await Registration.find({ eventId, status: { $in: ['pending', 'confirmed'] } });
		const userIds = regs.map(r => r.userId);
		const users = await User.findAll({ where: { id: userIds }, attributes: ['id', 'fullName', 'email'] });
		const regByUserId = new Map(regs.map(r => [r.userId, r]));
		const participants = users.map(u => ({
			id: u.id,
			fullName: u.fullName,
			email: u.email,
			registrationDate: regByUserId.get(u.id)?.registeredAt || null,
			status: regByUserId.get(u.id)?.status || 'confirmed',
		}));
		return res.json({ participants });
	} catch (err) {
		console.error('Get participants error:', err);
		return res.status(500).json({ message: 'Failed to fetch participants' });
	}
}

// GET /hackathons/:id/submissions
async function getHackathonSubmissions(req, res) {
	try {
		const eventId = parseInt(req.params.id);
		const submissions = await Submission.find({ eventId }).sort({ submissionDate: -1 });
		return res.json({ submissions });
	} catch (err) {
		console.error('Get hackathon submissions error:', err);
		return res.status(500).json({ message: 'Failed to fetch submissions' });
	}
}

// POST /hackathons/:id/submissions
async function createHackathonSubmission(req, res) {
	try {
		const eventId = parseInt(req.params.id);
		const body = { ...req.body, eventId };
		// Reuse logic from submission controller (minimal validation here)
		const submission = await Submission.create({
			teamId: body.teamId,
			eventId,
			githubLink: body.githubUrl || body.githubLink,
			docLink: body.docLink || body.documentationUrl,
			videoLink: body.videoUrl || body.demoUrl,
			projectName: body.projectName,
			projectDescription: body.description,
			technologies: body.technologies || [],
			features: body.features || [],
			status: 'Submitted',
		});
		audit(req.currentUser.id, 'submission_created', { eventId, teamId: body.teamId, submissionId: submission._id });
		emitToRoom(`event:${eventId}`, 'submission_update', { submissionId: submission._id, type: 'status_changed', data: { status: 'Submitted' } });
		return res.status(201).json({ submission });
	} catch (err) {
		console.error('Create hackathon submission error:', err);
		return res.status(500).json({ message: 'Failed to submit project' });
	}
}

// GET /hackathons/:id/submissions/:submissionId
async function getSubmissionById(req, res) {
	try {
		const submission = await Submission.findById(req.params.submissionId);
		if (!submission) return res.status(404).json({ message: 'Submission not found' });
		return res.json({ submission });
	} catch (err) {
		console.error('Get submission error:', err);
		return res.status(500).json({ message: 'Failed to fetch submission' });
	}
}

// PUT /hackathons/:id/submissions/:submissionId
async function updateSubmissionById(req, res) {
	try {
		const submission = await Submission.findById(req.params.submissionId);
		if (!submission) return res.status(404).json({ message: 'Submission not found' });
		// Check team membership
		const team = await Team.findByPk(submission.teamId, { include: [{ model: TeamMember, as: 'members' }] });
		const isMember = team?.members?.some(m => m.userId === req.currentUser.id);
		if (!isMember) return res.status(403).json({ message: 'Forbidden' });
		const updated = await Submission.findByIdAndUpdate(
			req.params.submissionId,
			{ ...req.body, lastModified: new Date() },
			{ new: true, runValidators: true }
		);
		audit(req.currentUser.id, 'submission_updated', { eventId: submission.eventId, teamId: submission.teamId, submissionId: submission._id });
		emitToRoom(`submission:${submission._id}`, 'submission_update', { submissionId: submission._id, type: 'status_changed', data: { updated: true } });
		return res.json({ submission: updated });
	} catch (err) {
		console.error('Update submission error:', err);
		return res.status(500).json({ message: 'Failed to update submission' });
	}
}

// POST /hackathons/:id/submissions/:submissionId/judge
async function judgeSubmission(req, res) {
	try {
		const { submissionId } = req.params;
		const { score, feedback, criteria, roundId } = req.body;
		const judgeProfileId = req.currentUser.judgeProfile?.id;
		if (!judgeProfileId) return res.status(403).json({ message: 'Judge profile not found' });
		const submission = await Submission.findById(submissionId);
		if (!submission) return res.status(404).json({ message: 'Submission not found' });
		// Ensure judge is assigned to this event
		const assignment = await JudgeEventAssignment.findOne({ where: { judgeId: judgeProfileId, eventId: submission.eventId, isActive: true } });
		if (!assignment) return res.status(403).json({ message: 'You are not assigned to this event' });
		if (typeof score !== 'number' || score < 0 || score > 100) {
			return res.status(400).json({ message: 'Score must be between 0 and 100' });
		}
		// Validate roundId and criteria
		const event = await Event.findByPk(submission.eventId);
		const rounds = event?.rounds || [];
		if (rounds.length && roundId && !rounds.some(r => r.id === roundId)) {
			return res.status(400).json({ message: 'Invalid roundId' });
		}
		const criteriaDefs = event?.customCriteria || [];
		if (criteria && criteriaDefs.length) {
			for (const [critId, val] of Object.entries(criteria)) {
				const def = criteriaDefs.find(c => c.id === critId);
				if (!def) return res.status(400).json({ message: `Invalid criteria: ${critId}` });
				if (typeof val !== 'number' || val < 0 || val > def.maxScore) {
					return res.status(400).json({ message: `Score out of range for ${critId}` });
				}
			}
		}
		await Submission.findByIdAndUpdate(submissionId, {
			$push: { scores: { judgeId: judgeProfileId, roundId, score, feedback, criteria, submittedAt: new Date() } },
		});
		audit(req.currentUser.id, 'review_submitted', { eventId: submission.eventId, teamId: submission.teamId, submissionId: submission._id, metadata: { score } });
		emitToRoom(`submission:${submission._id}`, 'submission_update', { submissionId: submission._id, type: 'review_added', data: { score } });
		return res.status(200).json({ message: 'Score submitted' });
	} catch (err) {
		console.error('Judge submission error:', err);
		return res.status(500).json({ message: 'Failed to submit score' });
	}
}

// GET /hackathons/:id/leaderboard
async function getLeaderboard(req, res) {
	try {
		const eventId = parseInt(req.params.id);
		const submissions = await Submission.find({ eventId });
		const event = await Event.findByPk(eventId);
		
		const entries = submissions.map(s => {
			const scores = Array.isArray(s.scores) ? s.scores : [];
			// Weighted by rounds if present
			let total = 0; let weightSum = 0;
			if (event && event.rounds && event.rounds.length) {
				const roundDefs = event.rounds;
				for (const rd of roundDefs) {
					const rdScores = scores.filter(sc => sc.roundId === rd.id);
					if (rdScores.length) {
						const avg = rdScores.reduce((sum, sc) => sum + (sc.score || 0), 0) / rdScores.length;
						total += avg * (rd.weight || 1);
						weightSum += (rd.weight || 1);
					}
				}
				// If no round-specific scores were found, fall back to averaging all scores
				if (!weightSum) {
					const avgAll = scores.length ? (scores.reduce((sum, sc) => sum + (sc.score || 0), 0) / scores.length) : 0;
					return { teamId: s.teamId, submissionId: s._id, score: Math.round(avgAll * 100) / 100 };
				}
				const finalScore = total / weightSum;
				return { teamId: s.teamId, submissionId: s._id, score: Math.round(finalScore * 100) / 100 };
			}
			const avg = scores.length ? (scores.reduce((sum, sc) => sum + (sc.score || 0), 0) / scores.length) : 0;
			return { teamId: s.teamId, submissionId: s._id, score: Math.round(avg * 100) / 100 };
		}).sort((a, b) => b.score - a.score)
			.map((e, idx) => ({ ...e, rank: idx + 1 }));
		emitToRoom(`event:${eventId}`, 'event_announcement', { eventId, type: 'leaderboard_update', message: 'Leaderboard updated', timestamp: new Date().toISOString() });
		return res.json({ entries });
	} catch (err) {
		console.error('Get leaderboard error:', err);
		return res.status(500).json({ message: 'Failed to fetch leaderboard' });
	}
}

module.exports = {
	listHackathons,
	getHackathon,
	createHackathon,
	updateHackathon,
	deleteHackathon,
	registerForHackathon,
	unregisterFromHackathon,
	getParticipants,
	getHackathonSubmissions,
	createHackathonSubmission,
	getLeaderboard,
	createHackathonAnnouncement,
	getHackathonAnnouncements,
	getHackathonStats,
};

// POST /hackathons/:id/announcements
async function createHackathonAnnouncement(req, res) {
	try {
		const eventId = parseInt(req.params.id);
		const organizerId = req.currentUser.id;
		const { title, message, visibility, type, priority, isPinned, isPublic, targetAudience, scheduledFor, expiresAt, tags } = req.body;
		const announcement = await Announcement.create({
			eventId,
			organizerId,
			title,
			message,
			visibility,
			type,
			priority,
			isPinned,
			isPublic,
			targetAudience,
			scheduledFor,
			expiresAt,
			tags,
			status: scheduledFor && scheduledFor > new Date() ? 'Scheduled' : 'Published',
		});
		audit(organizerId, 'announcement_created', { eventId, metadata: { title } });
		const visibilityFinal = visibility || (Array.isArray(targetAudience)
			? (targetAudience.includes('Participants') && targetAudience.includes('Judges') ? 'Both' : (targetAudience.includes('Judges') ? 'Judges' : 'Participants'))
			: 'Participants');
		if (visibilityFinal === 'Participants' || visibilityFinal === 'Both') {
			try {
				const { Registration } = require('../models/mongo');
				const regs = await Registration.find({ eventId, status: { $in: ['pending', 'confirmed'] } });
				const participantUserIds = Array.from(new Set(regs.map(r => r.userId).filter(Boolean)));
				const timestamp = new Date().toISOString();
				for (const uid of participantUserIds) {
					emitToRoom(`user:${uid}`, 'notification', { userId: uid, type: 'announcement', title, body: message, link: `/events/${eventId}`, timestamp });
				}
			} catch (partErr) {
				console.warn('Failed to emit to participants:', partErr?.message || partErr);
			}
		}
		if (visibilityFinal === 'Judges' || visibilityFinal === 'Both') {
			try {
				const { JudgeEventAssignment, Judge } = require('../models/sql');
				const assignments = await JudgeEventAssignment.findAll({
					where: { eventId, isActive: true },
					include: [{ model: Judge, as: 'judge', attributes: ['userId'] }],
				});
				const judgeUserIds = assignments.map(a => a.judge?.userId).filter(Boolean);
				const timestamp = new Date().toISOString();
				for (const uid of judgeUserIds) {
					emitToRoom(`user:${uid}`, 'notification', { userId: uid, type: 'announcement', title, body: message, link: `/events/${eventId}`, timestamp });
				}
			} catch (err) {
				console.warn('Failed to emit to judges:', err?.message || err);
			}
		}
		return res.status(201).json({ announcement });
	} catch (err) {
		console.error('Create hackathon announcement error:', err);
		return res.status(500).json({ message: 'Failed to create announcement' });
	}
}

// GET /hackathons/:id/announcements
async function getHackathonAnnouncements(req, res) {
	try {
		const eventId = parseInt(req.params.id);
		const announcements = await Announcement.findActiveByEvent(eventId);
		return res.json({ announcements });
	} catch (err) {
		console.error('Get hackathon announcements error:', err);
		return res.status(500).json({ message: 'Failed to fetch announcements' });
	}
}

// GET /hackathons/:id/stats
async function getHackathonStats(req, res) {
	try {
		const eventId = parseInt(req.params.id);
		const [participants, teams, submissions, scoreAgg] = await Promise.all([
			Registration.countDocuments({ eventId, status: { $in: ['pending', 'confirmed'] } }),
			Team.count({ where: { eventId } }),
			Submission.countDocuments({ eventId }),
			Submission.aggregate([
				{ $match: { eventId } },
				{ $unwind: { path: '$scores', preserveNullAndEmptyArrays: false } },
				{ $group: { _id: null, avgScore: { $avg: '$scores.score' }, totalReviews: { $sum: 1 } } },
			]),
		]);
		const scores = scoreAgg[0] || { avgScore: 0, totalReviews: 0 };
		return res.json({ participants, teams, submissions, averageScore: Math.round((scores.avgScore || 0) * 100) / 100, totalReviews: scores.totalReviews });
	} catch (err) {
		console.error('Get hackathon stats error:', err);
		return res.status(500).json({ message: 'Failed to fetch stats' });
	}
}


