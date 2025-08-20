const express = require('express');
const router = express.Router();

const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventsByUser,
  changeEventStatus,
  registerForEvent,
  unregisterFromEvent,
} = require('../controllers/eventController');

const {
  authMiddleware,
  authorizeOrganizer,
  authorizeParticipant,
  optionalAuth,
} = require('../middleware/authMiddleware');

const {
  validateInput,
  eventSchemas,
} = require('../middleware/validateInput');

// Public routes (with optional authentication)
router.get('/', optionalAuth, getAllEvents);

// Protected routes
// Note: Define '/user/events' before '/:id' to avoid shadowing by the dynamic route
router.get('/user/events', authMiddleware, getEventsByUser);
router.get('/:id', optionalAuth, getEventById);

// Organizer only routes
router.post('/', authMiddleware, authorizeOrganizer, validateInput(eventSchemas.create), createEvent);
router.put('/:id', authMiddleware, authorizeOrganizer, validateInput(eventSchemas.update), updateEvent);
router.delete('/:id', authMiddleware, authorizeOrganizer, deleteEvent);
router.patch('/:id/status', authMiddleware, authorizeOrganizer, changeEventStatus);
router.post('/:id/register', authMiddleware, authorizeParticipant, registerForEvent);
router.delete('/:id/register', authMiddleware, authorizeParticipant, unregisterFromEvent);

module.exports = router;
