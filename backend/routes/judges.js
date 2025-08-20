const express = require('express');
const router = express.Router();

const {
  assignJudgeToEvent,
  removeJudgeFromEvent,
  getJudgesByEvent,
  getJudgeEvents,
  submitScore,
  getEventScores,
  getJudgeProfile,
  updateJudgeProfile,
  getJudgeAnalytics,
} = require('../controllers/judgeController');

const {
  authMiddleware,
  authorizeOrganizer,
  authorizeJudge,
} = require('../middleware/authMiddleware');

// Public routes
router.get('/event/:eventId', getJudgesByEvent);

// Protected routes
router.get('/profile', authMiddleware, authorizeJudge, getJudgeProfile);
router.put('/profile', authMiddleware, authorizeJudge, updateJudgeProfile);
router.get('/events', authMiddleware, authorizeJudge, getJudgeEvents);
router.post('/score', authMiddleware, authorizeJudge, submitScore);
router.get('/analytics', authMiddleware, authorizeJudge, getJudgeAnalytics);

// Organizer only routes
router.post('/assign', authMiddleware, authorizeOrganizer, assignJudgeToEvent);
router.delete('/:judgeId/event/:eventId', authMiddleware, authorizeOrganizer, removeJudgeFromEvent);
router.get('/scores/:eventId', authMiddleware, authorizeOrganizer, getEventScores);

module.exports = router;
