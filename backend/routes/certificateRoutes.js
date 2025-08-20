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

// Create a test certificate with PDF (for testing purposes)
router.post('/test/create-with-pdf', async (req, res) => {
  try {
    const { Certificate } = require('../models/sql');
    const PDFDocument = require('pdfkit');
    const fs = require('fs');
    const path = require('path');
    
    // Create a test certificate record
    const testCertificate = await Certificate.create({
      userId: 1, // Assuming user ID 1 exists
      eventId: 1, // Assuming event ID 1 exists
      type: 'participation',
      title: 'Test Certificate with PDF',
      description: 'This is a test certificate with an actual PDF file for testing download functionality',
      certificateNumber: `TEST-PDF-${Date.now()}`,
      issuedAt: new Date()
    });
    
    // Generate a simple PDF
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape'
    });
    
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', async () => {
      const pdfBuffer = Buffer.concat(chunks);
      
      // Save PDF to uploads directory
      const uploadsDir = path.join(__dirname, '../uploads/certificates');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      const filename = `certificate_${testCertificate.id}_test.pdf`;
      const filepath = path.join(uploadsDir, filename);
      fs.writeFileSync(filepath, pdfBuffer);
      
      // Update certificate with PDF URL
      await testCertificate.update({
        pdfUrl: `/uploads/certificates/${filename}`
      });
      
      res.json({ 
        message: 'Test certificate with PDF created successfully',
        certificate: testCertificate,
        pdfPath: filepath
      });
    });
    
    // Add content to PDF
    doc.fontSize(24)
       .text('TEST CERTIFICATE', 100, 100)
       .fontSize(16)
       .text(`Certificate ID: ${testCertificate.id}`, 100, 150)
       .text(`Certificate Number: ${testCertificate.certificateNumber}`, 100, 180)
       .text('This is a test certificate for download testing', 100, 210);
    
    doc.end();
  } catch (error) {
    console.error('Error creating test certificate with PDF:', error);
    res.status(500).json({ 
      message: 'Failed to create test certificate with PDF',
      error: error.message
    });
  }
});

// Debug endpoint to list all certificates
router.get('/debug/list', async (req, res) => {
  try {
    const { Certificate, User, Event } = require('../models/sql');
    
    const certificates = await Certificate.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'fullName', 'email'] },
        { model: Event, as: 'event', attributes: ['id', 'name'] }
      ],
      order: [['id', 'ASC']]
    });
    
    res.json({ 
      message: 'All certificates in database',
      count: certificates.length,
      certificates: certificates.map(cert => ({
        id: cert.id,
        userId: cert.userId,
        eventId: cert.eventId,
        type: cert.type,
        title: cert.title,
        certificateNumber: cert.certificateNumber,
        pdfUrl: cert.pdfUrl,
        issuedAt: cert.issuedAt,
        user: cert.user ? { id: cert.user.id, name: cert.user.fullName } : null,
        event: cert.event ? { id: cert.event.id, name: cert.event.name } : null
      }))
    });
  } catch (error) {
    console.error('Error listing certificates:', error);
    res.status(500).json({ 
      message: 'Failed to list certificates',
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

    console.log(`Download request for certificate ${certificateId} by user ${userId}`);

    const result = await downloadCertificate(certificateId, userId);
    
    console.log(`Sending file: ${result.filepath}`);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.sendFile(result.filepath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).json({ 
          message: 'Failed to send certificate file',
          error: process.env.NODE_ENV === 'development' ? err.message : 'File transmission error'
        });
      }
    });
  } catch (error) {
    console.error('Error downloading certificate:', error);
    
    // Provide more specific error messages
    let statusCode = 500;
    let message = 'Failed to download certificate';
    
    if (error.message.includes('not found')) {
      statusCode = 404;
      message = error.message;
    } else if (error.message.includes('not generated')) {
      statusCode = 400;
      message = error.message;
    } else if (error.message.includes('access denied')) {
      statusCode = 403;
      message = error.message;
    }
    
    res.status(statusCode).json({ 
      message,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
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
