const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');

const {
  getDashboardData,
  getRegisteredEvents,
  getParticipantTeams,
  getParticipantSubmissions,
  getActivities,
  getDeadlines,
} = require('../controllers/participantController');

router.use(authMiddleware);

router.get('/dashboard', getDashboardData);
router.get('/events/registered', getRegisteredEvents);
router.get('/teams', getParticipantTeams);
router.get('/submissions', getParticipantSubmissions);
router.get('/activities', getActivities);
router.get('/deadlines', getDeadlines);

module.exports = router;


