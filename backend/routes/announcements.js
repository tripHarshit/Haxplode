const express = require('express');
const router = express.Router();

const {
  createAnnouncement,
  getAnnouncementsByEvent,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  markAnnouncementAsRead,
  getPinnedAnnouncements,
} = require('../controllers/announcementController');

const {
  authMiddleware,
  authorizeOrganizer,
  optionalAuth,
} = require('../middleware/authMiddleware');

const {
  validateInput,
  announcementSchemas,
} = require('../middleware/validateInput');

// Public routes (with optional auth for role-aware filtering)
router.get('/event/:eventId', optionalAuth, getAnnouncementsByEvent);
router.get('/event/:eventId/pinned', optionalAuth, getPinnedAnnouncements);
router.get('/:id', getAnnouncementById);

// Protected routes
router.post('/:id/read', authMiddleware, markAnnouncementAsRead);

// Organizer only routes
router.post('/', authMiddleware, authorizeOrganizer, validateInput(announcementSchemas.create), createAnnouncement);
router.put('/:id', authMiddleware, authorizeOrganizer, updateAnnouncement);
router.delete('/:id', authMiddleware, authorizeOrganizer, deleteAnnouncement);

module.exports = router;
