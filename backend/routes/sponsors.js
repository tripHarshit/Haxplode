const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeOrganizer } = require('../middleware/authMiddleware');
const { listSponsors, createSponsor, updateSponsor, deleteSponsor } = require('../controllers/sponsorController');

router.use(authMiddleware, authorizeOrganizer);

router.get('/', listSponsors);
router.post('/', createSponsor);
router.put('/:id', updateSponsor);
router.delete('/:id', deleteSponsor);

module.exports = router;


