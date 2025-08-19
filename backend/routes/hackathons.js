const express = require('express');
const router = express.Router();

const {
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
} = require('../controllers/hackathonController');

const { authMiddleware, authorizeOrganizer, authorizeParticipant, optionalAuth } = require('../middleware/authMiddleware');

// Public
router.get('/', optionalAuth, listHackathons);
router.get('/:id', optionalAuth, getHackathon);
router.get('/:id/submissions', optionalAuth, getHackathonSubmissions);
// Specific submission routes (these functions don't exist yet, commenting out for now)
// router.get('/:id/submissions/:submissionId', optionalAuth, getSubmissionById);
// router.put('/:id/submissions/:submissionId', auth, updateSubmissionById);
// router.post('/:id/submissions/:submissionId/judge', auth, authorizeJudge, judgeSubmission);

router.get('/:id/leaderboard', optionalAuth, getLeaderboard);
router.get('/:id/participants', optionalAuth, getParticipants);
router.get('/:id/announcements', optionalAuth, getHackathonAnnouncements);
router.post('/:id/announcements', authMiddleware, authorizeOrganizer, createHackathonAnnouncement);
router.get('/:id/stats', optionalAuth, getHackathonStats);

// Organizer
router.post('/', authMiddleware, authorizeOrganizer, createHackathon);
router.put('/:id', authMiddleware, authorizeOrganizer, updateHackathon);
router.delete('/:id', authMiddleware, authorizeOrganizer, deleteHackathon);

// Participant
router.post('/:id/register', authMiddleware, authorizeParticipant, registerForHackathon);
router.delete('/:id/register', authMiddleware, authorizeParticipant, unregisterFromHackathon);
router.post('/:id/submissions', authMiddleware, authorizeParticipant, createHackathonSubmission);

module.exports = router;


