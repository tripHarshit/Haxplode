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
} = require('../controllers/eventController');

const {
  authMiddleware,
  authorizeOrganizer,
  optionalAuth,
} = require('../middleware/authMiddleware');

const {
  validateInput,
  eventSchemas,
} = require('../middleware/validateInput');

// Public routes (with optional authentication)
router.get('/', optionalAuth, getAllEvents);
router.get('/:id', optionalAuth, getEventById);

// Protected routes
router.get('/user/events', authMiddleware, getEventsByUser);

// Organizer only routes
router.post('/', authMiddleware, authorizeOrganizer, validateInput(eventSchemas.create), createEvent);
router.put('/:id', authMiddleware, authorizeOrganizer, validateInput(eventSchemas.update), updateEvent);
router.delete('/:id', authMiddleware, authorizeOrganizer, deleteEvent);
router.patch('/:id/status', authMiddleware, authorizeOrganizer, changeEventStatus);

module.exports = router;
