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
} = require('../middleware/authMiddleware');

const {
  validateInput,
  announcementSchemas,
} = require('../middleware/validateInput');

// Public routes
router.get('/event/:eventId', getAnnouncementsByEvent);
router.get('/event/:eventId/pinned', getPinnedAnnouncements);
router.get('/:id', getAnnouncementById);

// Protected routes
router.post('/:id/read', authMiddleware, markAnnouncementAsRead);

// Organizer only routes
router.post('/', authMiddleware, authorizeOrganizer, validateInput(announcementSchemas.create), createAnnouncement);
router.put('/:id', authMiddleware, authorizeOrganizer, updateAnnouncement);
router.delete('/:id', authMiddleware, authorizeOrganizer, deleteAnnouncement);

module.exports = router;
