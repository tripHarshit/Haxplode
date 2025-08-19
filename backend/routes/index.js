const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/events', require('./events'));
router.use('/teams', require('./teams'));
router.use('/submissions', require('./submissions'));
router.use('/judges', require('./judges'));
router.use('/announcements', require('./announcements'));
router.use('/chats', require('./chats'));
router.use('/hackathons', require('./hackathons'));

module.exports = router;


