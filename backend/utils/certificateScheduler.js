const cron = require('node-cron');
const { Event, Certificate } = require('../models/sql');
const { generateEventCertificates } = require('../controllers/certificateController');

// Schedule certificate generation for completed events
const scheduleCertificateGeneration = () => {
  // Run every hour to check for completed events
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('🔍 Checking for completed events to generate certificates...');
      
      const now = new Date();
      
      // Find events that have ended but don't have certificates generated yet
      const completedEvents = await Event.findAll({
        where: {
          status: 'Completed',
          // Add a condition to check if certificates were already generated
          // This could be enhanced with a separate table to track certificate generation status
        },
                 include: [
           {
             model: Certificate,
             as: 'certificates',
             required: false
           }
         ]
      });

      for (const event of completedEvents) {
        try {
          // Check if certificates were already generated for this event
          if (event.certificates && event.certificates.length > 0) {
            console.log(`✅ Certificates already generated for event: ${event.name}`);
            continue;
          }

          // Check if event has actually ended
          const eventEndDate = new Date(event.timeline.endDate);
          if (eventEndDate > now) {
            continue; // Event hasn't ended yet
          }

          console.log(`🎖️ Generating certificates for completed event: ${event.name}`);
          
          // Generate certificates for this event
          const certificates = await generateEventCertificates(event.id);
          
          console.log(`✅ Generated ${certificates.length} certificates for event: ${event.name}`);
          
          // You could also emit a notification to participants here
          // emitToRoom(`event:${event.id}`, 'certificates_generated', { 
          //   eventId: event.id, 
          //   certificateCount: certificates.length 
          // });
          
        } catch (error) {
          console.error(`❌ Failed to generate certificates for event ${event.name}:`, error);
        }
      }
    } catch (error) {
      console.error('❌ Certificate scheduler error:', error);
    }
  });

  console.log('📅 Certificate generation scheduler started');
};

// Manual trigger for certificate generation (useful for testing)
const triggerCertificateGeneration = async (eventId) => {
  try {
    console.log(`🎖️ Manually triggering certificate generation for event: ${eventId}`);
    const certificates = await generateEventCertificates(eventId);
    console.log(`✅ Generated ${certificates.length} certificates manually`);
    return certificates;
  } catch (error) {
    console.error('❌ Manual certificate generation failed:', error);
    throw error;
  }
};

// Check and generate certificates for a specific event
const checkAndGenerateEventCertificates = async (eventId) => {
  try {
    const event = await Event.findByPk(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Check if event is completed
    if (event.status !== 'Completed') {
      throw new Error('Event must be completed to generate certificates');
    }

    // Check if certificates already exist
    const existingCertificates = await Certificate.findAll({
      where: { eventId }
    });

    if (existingCertificates.length > 0) {
      console.log(`✅ Certificates already exist for event: ${event.name}`);
      return existingCertificates;
    }

    // Generate certificates
    const certificates = await generateEventCertificates(eventId);
    console.log(`✅ Generated ${certificates.length} certificates for event: ${event.name}`);
    return certificates;
  } catch (error) {
    console.error('❌ Check and generate certificates failed:', error);
    throw error;
  }
};

module.exports = {
  scheduleCertificateGeneration,
  triggerCertificateGeneration,
  checkAndGenerateEventCertificates
};
