const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { Certificate, User, Event, Team, sequelize } = require('../models/sql');
const { Registration } = require('../models/mongo');

// Generate a unique certificate number
const generateCertificateNumber = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `CERT-${timestamp}-${random}`.toUpperCase();
};

// Generate PDF certificate
const generateCertificatePDF = async (certificateData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Set up the document
      doc.font('Helvetica-Bold');
      
      // Background
      doc.rect(0, 0, doc.page.width, doc.page.height)
         .fill('#f8fafc');

      // Border
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
         .lineWidth(3)
         .stroke('#1e40af');

      // Inner border
      doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80)
         .lineWidth(1)
         .stroke('#3b82f6');

      // Header
      doc.fontSize(36)
         .fill('#1e40af')
         .text('CERTIFICATE OF PARTICIPATION', doc.page.width / 2, 80, { align: 'center' });

      // Subtitle
      doc.fontSize(18)
         .fill('#64748b')
         .text('This is to certify that', doc.page.width / 2, 140, { align: 'center' });

      // Participant name
      doc.fontSize(28)
         .fill('#1e293b')
         .text(certificateData.participantName, doc.page.width / 2, 180, { align: 'center' });

      // Participation text
      doc.fontSize(16)
         .fill('#475569')
         .text('has successfully participated in', doc.page.width / 2, 220, { align: 'center' });

      // Event name
      doc.fontSize(24)
         .fill('#1e40af')
         .text(certificateData.eventName, doc.page.width / 2, 260, { align: 'center' });

      // Event details
      doc.fontSize(14)
         .fill('#64748b')
         .text(`Event Theme: ${certificateData.eventTheme}`, doc.page.width / 2, 300, { align: 'center' });

      if (certificateData.projectName) {
        doc.text(`Project: ${certificateData.projectName}`, doc.page.width / 2, 320, { align: 'center' });
      }

      if (certificateData.teamName) {
        doc.text(`Team: ${certificateData.teamName}`, doc.page.width / 2, 340, { align: 'center' });
      }

      // Date
      doc.text(`Event Date: ${certificateData.eventDate}`, doc.page.width / 2, 380, { align: 'center' });

      // Certificate number
      doc.fontSize(12)
         .fill('#94a3b8')
         .text(`Certificate #: ${certificateData.certificateNumber}`, doc.page.width / 2, 420, { align: 'center' });

      // Footer
      doc.fontSize(14)
         .fill('#64748b')
         .text('This certificate is awarded in recognition of dedication, innovation, and collaborative spirit', 
               doc.page.width / 2, 480, { align: 'center' });

      // Signature line
      doc.fontSize(12)
         .fill('#475569')
         .text('_________________', doc.page.width / 2 - 100, 520)
         .text('_________________', doc.page.width / 2 + 100, 520);

      doc.text('Event Organizer', doc.page.width / 2 - 100, 540, { align: 'center' })
         .text('Date', doc.page.width / 2 + 100, 540, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Generate participation certificates for all participants of a completed event
const generateEventCertificates = async (eventId) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Get event details
    const event = await Event.findByPk(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Check if event is completed
    if (event.status !== 'Completed') {
      throw new Error('Event must be completed to generate certificates');
    }

    // Get all registrations for this event
    const registrations = await Registration.find({ eventId, status: 'confirmed' });
    
    const certificates = [];
    
    for (const registration of registrations) {
      // Check if certificate already exists
      const existingCertificate = await Certificate.findOne({
        where: { userId: registration.userId, eventId }
      });

      if (existingCertificate) {
        continue; // Skip if certificate already exists
      }

      // Get user details
      const user = await User.findByPk(registration.userId);
      if (!user) continue;

      // Get team details if applicable
      let team = null;
      if (registration.teamId) {
        team = await Team.findByPk(registration.teamId);
      }

      // Generate certificate data
      const certificateData = {
        participantName: user.fullName,
        eventName: event.name,
        eventTheme: event.theme,
        eventDate: `${new Date(event.timeline.startDate).toLocaleDateString()} - ${new Date(event.timeline.endDate).toLocaleDateString()}`,
        projectName: null, // Will be updated if project submission exists
        teamName: team ? team.name : null,
        certificateNumber: generateCertificateNumber()
      };

      // Generate PDF
      const pdfBuffer = await generateCertificatePDF(certificateData);
      
      // Save PDF to uploads directory
      const uploadsDir = path.join(__dirname, '../uploads/certificates');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filename = `certificate_${eventId}_${registration.userId}_${Date.now()}.pdf`;
      const filepath = path.join(uploadsDir, filename);
      fs.writeFileSync(filepath, pdfBuffer);

      // Create certificate record
      const certificate = await Certificate.create({
        userId: registration.userId,
        eventId: eventId,
        teamId: registration.teamId || null,
        type: 'participation',
        title: 'Certificate of Participation',
        description: `Participation certificate for ${event.name}`,
        projectName: null,
        score: null,
        rank: null,
        issuedAt: new Date(),
        certificateNumber: certificateData.certificateNumber,
        pdfUrl: `/uploads/certificates/${filename}`,
        metadata: {
          eventStartDate: event.timeline.startDate,
          eventEndDate: event.timeline.endDate,
          eventLocation: event.location,
          eventType: event.isVirtual ? 'Virtual' : 'In-Person'
        }
      }, { transaction });

      certificates.push(certificate);
    }

    await transaction.commit();
    return certificates;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// Get user certificates
const getUserCertificates = async (userId) => {
  try {
    console.log('getUserCertificates called with userId:', userId);
    
    // First check if the Certificate model is properly loaded
    if (!Certificate) {
      throw new Error('Certificate model not found');
    }
    
    // Check if the table exists by trying to describe it
    try {
      await sequelize.query("SELECT TOP 1 * FROM Certificates", { type: sequelize.QueryTypes.SELECT });
      console.log('Certificates table exists and is accessible');
    } catch (tableError) {
      console.error('Table access error:', tableError.message);
      throw new Error(`Certificates table not accessible: ${tableError.message}`);
    }
    
    // Simplified query without problematic includes
    const certificates = await Certificate.findAll({
      where: { userId },
      order: [['issuedAt', 'DESC']]
    });

    console.log('Certificates found:', certificates.length);
    return certificates;
  } catch (error) {
    console.error('Error in getUserCertificates:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
};

// Download certificate PDF
const downloadCertificate = async (certificateId, userId) => {
  try {
    console.log(`Attempting to download certificate ${certificateId} for user ${userId}`);
    
    const certificate = await Certificate.findOne({
      where: { id: certificateId, userId }
    });

    if (!certificate) {
      console.log(`Certificate ${certificateId} not found for user ${userId}`);
      throw new Error('Certificate not found or access denied');
    }

    console.log(`Found certificate:`, {
      id: certificate.id,
      certificateNumber: certificate.certificateNumber,
      pdfUrl: certificate.pdfUrl,
      userId: certificate.userId
    });

    // Check if PDF file exists
    if (!certificate.pdfUrl) {
      console.log(`Certificate ${certificateId} has no PDF URL, generating...`);
      await generatePDFForCertificate(certificate);
      console.log(`PDF generated for certificate ${certificateId}`);
      // Refresh certificate data to get the updated pdfUrl
      await certificate.reload();
    }

    // Fix the file path resolution
    const filepath = path.resolve(__dirname, '..', certificate.pdfUrl.replace('/uploads/', 'uploads/'));
    console.log(`Looking for PDF file at: ${filepath}`);

    if (!fs.existsSync(filepath)) {
      console.log(`PDF file not found at: ${filepath}`);
      
      // Try alternative path resolution
      const altPath = path.join(__dirname, '..', 'uploads', 'certificates', path.basename(certificate.pdfUrl));
      console.log(`Trying alternative path: ${altPath}`);
      
      if (fs.existsSync(altPath)) {
        console.log(`Found PDF at alternative path: ${altPath}`);
        return {
          filepath: altPath,
          filename: `certificate_${certificate.certificateNumber}.pdf`,
          certificate
        };
      }
      
      throw new Error('Certificate PDF file not found on server');
    }

    console.log(`PDF file found successfully at: ${filepath}`);
    return {
      filepath,
      filename: `certificate_${certificate.certificateNumber}.pdf`,
      certificate
    };
  } catch (error) {
    console.error(`Error in downloadCertificate for certificate ${certificateId}:`, error);
    throw error;
  }
};

// Generate winner certificates (for future use)
const generateWinnerCertificates = async (eventId, winners) => {
  // This function can be implemented later for generating winner certificates
  // with different designs and ranking information
};

// Generate PDF for existing certificate if it doesn't have one
const generatePDFForCertificate = async (certificate) => {
  try {
    console.log(`Generating PDF for certificate ${certificate.id}`);
    
    // Get user and event details
    const user = await User.findByPk(certificate.userId);
    const event = await Event.findByPk(certificate.eventId);
    
    if (!user || !event) {
      throw new Error('User or event not found for certificate');
    }
    
    // Get team details if applicable
    let team = null;
    if (certificate.teamId) {
      team = await Team.findByPk(certificate.teamId);
    }
    
    // Generate certificate data
    const certificateData = {
      participantName: user.fullName,
      eventName: event.name,
      eventTheme: event.theme || 'Hackathon',
      eventDate: `${new Date(event.timeline?.startDate || event.createdAt).toLocaleDateString()} - ${new Date(event.timeline?.endDate || event.createdAt).toLocaleDateString()}`,
      projectName: certificate.projectName,
      teamName: team ? team.name : null,
      certificateNumber: certificate.certificateNumber
    };
    
    // Generate PDF
    const pdfBuffer = await generateCertificatePDF(certificateData);
    
    // Save PDF to uploads directory
    const uploadsDir = path.join(__dirname, '../uploads/certificates');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const filename = `certificate_${certificate.id}_${Date.now()}.pdf`;
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, pdfBuffer);
    
    // Update certificate with PDF URL
    await certificate.update({
      pdfUrl: `/uploads/certificates/${filename}`
    });
    
    console.log(`PDF generated successfully for certificate ${certificate.id}`);
    return filepath;
  } catch (error) {
    console.error(`Error generating PDF for certificate ${certificate.id}:`, error);
    throw error;
  }
};

module.exports = {
  generateEventCertificates,
  getUserCertificates,
  downloadCertificate,
  generateWinnerCertificates,
  generatePDFForCertificate
};
