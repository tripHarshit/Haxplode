const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Certificate = require('../models/sql/Certificate');
const User = require('../models/sql/User');
const Event = require('../models/sql/Event');
const Team = require('../models/sql/Team');
const { Registration } = require('../models/mongo');
const { sequelize } = require('../config/sqlDatabase');

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
    const certificates = await Certificate.findAll({
      where: { userId },
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['name', 'theme', 'description', 'location', 'isVirtual']
        },
        {
          model: Team,
          as: 'team',
          attributes: ['name']
        }
      ],
      order: [['issuedAt', 'DESC']]
    });

    return certificates;
  } catch (error) {
    throw error;
  }
};

// Download certificate PDF
const downloadCertificate = async (certificateId, userId) => {
  try {
    const certificate = await Certificate.findOne({
      where: { id: certificateId, userId },
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['name', 'theme', 'description', 'location', 'isVirtual']
        },
        {
          model: Team,
          as: 'team',
          attributes: ['name']
        }
      ]
    });

    if (!certificate) {
      throw new Error('Certificate not found');
    }

    // Check if PDF file exists
    const filepath = path.join(__dirname, '..', certificate.pdfUrl);
    if (!fs.existsSync(filepath)) {
      throw new Error('Certificate PDF not found');
    }

    return {
      filepath,
      filename: `certificate_${certificate.certificateNumber}.pdf`,
      certificate
    };
  } catch (error) {
    throw error;
  }
};

// Generate winner certificates (for future use)
const generateWinnerCertificates = async (eventId, winners) => {
  // This function can be implemented later for generating winner certificates
  // with different designs and ranking information
};

module.exports = {
  generateEventCertificates,
  getUserCertificates,
  downloadCertificate,
  generateWinnerCertificates
};
