const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeOrganizer } = require('../middleware/authMiddleware');
const { sendNotification } = require('../controllers/notificationController');

router.post('/', authMiddleware, authorizeOrganizer, sendNotification);

module.exports = router;


