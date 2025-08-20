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
  assignSubmissionsToJudges,
  getAssignedSubmissions,
  submitReview,
  getEventResults,
} = require('../controllers/judgeController');

const {
  authMiddleware,
  authorizeOrganizer,
  authorizeJudge,
} = require('../middleware/authMiddleware');

// Add logging middleware for all judge routes
router.use((req, res, next) => {
  console.log('🔍 [judgeRoutes] Request:', req.method, req.path);
  console.log('🔍 [judgeRoutes] Query params:', req.query);
  console.log('🔍 [judgeRoutes] Body:', req.body);
  next();
});

// Test endpoint to check if routes are working
router.get('/test', (req, res) => {
  console.log('🔍 [judgeRoutes] Test endpoint hit');
  res.json({ 
    success: true, 
    message: 'Judge routes are working',
    timestamp: new Date().toISOString()
  });
});

// Public routes
router.get('/event/:eventId', getJudgesByEvent);

// Protected routes
router.get('/profile', authMiddleware, authorizeJudge, getJudgeProfile);
router.put('/profile', authMiddleware, authorizeJudge, updateJudgeProfile);
router.get('/events', authMiddleware, authorizeJudge, getJudgeEvents);
router.post('/score', authMiddleware, authorizeJudge, submitScore);
router.get('/analytics', authMiddleware, authorizeJudge, getJudgeAnalytics);
router.get('/submissions/:eventId', authMiddleware, authorizeJudge, getAssignedSubmissions);
router.post('/review', authMiddleware, authorizeJudge, submitReview);

// Organizer only routes
router.post('/assign', authMiddleware, authorizeOrganizer, assignJudgeToEvent);
router.delete('/:judgeId/event/:eventId', authMiddleware, authorizeOrganizer, removeJudgeFromEvent);
router.get('/scores/:eventId', authMiddleware, authorizeOrganizer, getEventScores);
router.post('/assign-submissions/:eventId', authMiddleware, authorizeOrganizer, assignSubmissionsToJudges);
router.get('/results/:eventId', authMiddleware, authorizeOrganizer, getEventResults);

module.exports = router;
