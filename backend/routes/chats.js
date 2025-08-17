const express = require('express');
const router = express.Router();

const {
  createChatMessage,
  getChatMessagesByEvent,
  getQuestionsByEvent,
  getAnswersForQuestion,
  updateChatMessage,
  deleteChatMessage,
  addReaction,
  removeReaction,
  markMessageAsRead,
  togglePinMessage,
} = require('../controllers/chatController');

const {
  authMiddleware,
  authorizeOrganizer,
} = require('../middleware/authMiddleware');

const {
  validateInput,
  chatSchemas,
} = require('../middleware/validateInput');

// Public routes
router.get('/event/:eventId', getChatMessagesByEvent);
router.get('/event/:eventId/questions', getQuestionsByEvent);
router.get('/question/:questionId/answers', getAnswersForQuestion);

// Protected routes
router.post('/', authMiddleware, validateInput(chatSchemas.create), createChatMessage);
router.put('/:id', authMiddleware, updateChatMessage);
router.delete('/:id', authMiddleware, deleteChatMessage);
router.post('/:id/reactions', authMiddleware, addReaction);
router.delete('/:id/reactions', authMiddleware, removeReaction);
router.post('/:id/read', authMiddleware, markMessageAsRead);

// Organizer only routes
router.patch('/:id/pin', authMiddleware, authorizeOrganizer, togglePinMessage);

module.exports = router;
