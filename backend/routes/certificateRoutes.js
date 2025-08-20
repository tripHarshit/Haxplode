const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { 
  getUserCertificates, 
  downloadCertificate,
  generateEventCertificates 
} = require('../controllers/certificateController');

// Get user's certificates
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Ensure user can only access their own certificates
    if (req.currentUser.id !== userId && req.currentUser.role !== 'Organizer') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const certificates = await getUserCertificates(userId);
    res.json({ certificates });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ message: 'Failed to fetch certificates' });
  }
});

// Download certificate PDF
router.get('/download/:certificateId', authMiddleware, async (req, res) => {
  try {
    const certificateId = parseInt(req.params.certificateId);
    const userId = req.currentUser.id;

    const result = await downloadCertificate(certificateId, userId);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.sendFile(result.filepath);
  } catch (error) {
    console.error('Error downloading certificate:', error);
    res.status(500).json({ message: 'Failed to download certificate' });
  }
});

// Generate certificates for an event (Organizer only)
router.post('/generate/:eventId', authMiddleware, async (req, res) => {
  try {
    if (req.currentUser.role !== 'Organizer') {
      return res.status(403).json({ message: 'Only organizers can generate certificates' });
    }

    const eventId = parseInt(req.params.eventId);
    const certificates = await generateEventCertificates(eventId);
    
    res.json({ 
      message: `Generated ${certificates.length} certificates successfully`,
      certificates 
    });
  } catch (error) {
    console.error('Error generating certificates:', error);
    res.status(500).json({ message: error.message || 'Failed to generate certificates' });
  }
});

module.exports = router;
