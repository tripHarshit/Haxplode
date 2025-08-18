const express = require('express');
const router = express.Router();

const {
  signup,
  login,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  logout,
} = require('../controllers/authController');

const {
  authMiddleware,
  authorizeParticipant,
  authorizeOrganizer,
  authorizeJudge,
} = require('../middleware/authMiddleware');

const {
  validateInput,
  authSchemas,
} = require('../middleware/validateInput');

// Public routes
router.post('/signup', validateInput(authSchemas.signup), signup);
router.post('/login', validateInput(authSchemas.login), login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, validateInput(authSchemas.updateProfile), updateProfile);
router.put('/change-password', authMiddleware, changePassword);
router.post('/logout', authMiddleware, logout);

module.exports = router;
