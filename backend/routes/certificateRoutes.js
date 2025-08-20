const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { 
  getUserCertificates, 
  downloadCertificate,
  generateEventCertificates 
} = require('../controllers/certificateController');

// Test endpoint to check if Certificate model is working
router.get('/test', async (req, res) => {
  try {
    const { Certificate, sequelize } = require('../models/sql');
    
    // Check if we can connect to the database
    await sequelize.authenticate();
    
    // Check if the Certificates table exists
    const tableExists = await sequelize.query(
      "SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Certificates'",
      { type: sequelize.QueryTypes.SELECT }
    );
    
    const hasTable = tableExists[0].count > 0;
    
    if (hasTable) {
      // Check record count
      const count = await Certificate.count();
      res.json({ 
        message: 'Certificate model is working',
        tableExists: true,
        recordCount: count,
        databaseConnected: true
      });
    } else {
      res.json({ 
        message: 'Certificate table does not exist',
        tableExists: false,
        recordCount: 0,
        databaseConnected: true
      });
    }
  } catch (error) {
    console.error('Certificate model test failed:', error);
    res.status(500).json({ 
      message: 'Certificate model test failed',
      error: error.message,
      stack: error.stack
    });
  }
});

// Create a test certificate (for testing purposes)
router.post('/test/create', async (req, res) => {
  try {
    const { Certificate } = require('../models/sql');
    
    // Create a test certificate
    const testCertificate = await Certificate.create({
      userId: 1, // Assuming user ID 1 exists
      eventId: 1, // Assuming event ID 1 exists
      type: 'participation',
      title: 'Test Certificate',
      description: 'This is a test certificate for testing purposes',
      certificateNumber: `TEST-${Date.now()}`,
      issuedAt: new Date()
    });
    
    res.json({ 
      message: 'Test certificate created successfully',
      certificate: testCertificate
    });
  } catch (error) {
    console.error('Error creating test certificate:', error);
    res.status(500).json({ 
      message: 'Failed to create test certificate',
      error: error.message
    });
  }
});

// Get user's certificates
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    console.log('Fetching certificates for user:', userId);
    
    // Ensure user can only access their own certificates
    if (req.currentUser.id !== userId && req.currentUser.role !== 'Organizer') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const certificates = await getUserCertificates(userId);
    console.log('Found certificates:', certificates.length);
    res.json({ certificates });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to fetch certificates',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
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
