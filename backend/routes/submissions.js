const express = require('express');
const router = express.Router();

const {
  createSubmission,
  getSubmissionsByEvent,
  getSubmissionById,
  updateSubmission,
  getUserSubmissions,
  changeSubmissionStatus,
} = require('../controllers/submissionController');

const {
  authMiddleware,
  authorizeParticipant,
  authorizeOrganizerOrJudge,
} = require('../middleware/authMiddleware');

const {
  validateInput,
  submissionSchemas,
} = require('../middleware/validateInput');

// Public routes
router.get('/event/:eventId', getSubmissionsByEvent);
router.get('/:id', getSubmissionById);

// Protected routes
router.get('/user/submissions', authMiddleware, getUserSubmissions);

// Participant only routes
router.post('/', authMiddleware, authorizeParticipant, validateInput(submissionSchemas.create), createSubmission);
router.put('/:id', authMiddleware, authorizeParticipant, updateSubmission);

// Organizer/Judge only routes
router.patch('/:id/status', authMiddleware, authorizeOrganizerOrJudge, changeSubmissionStatus);

module.exports = router;
