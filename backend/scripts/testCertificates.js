require('dotenv').config();
const { connectSQL } = require('../config/sqlDatabase');
const { connectMongo } = require('../models/mongo');
const { generateEventCertificates } = require('../controllers/certificateController');

async function testCertificateGeneration() {
  try {
    console.log('🔌 Connecting to databases...');
    await connectSQL();
    await connectMongo();
    console.log('✅ Connected to databases');

    // Test certificate generation for a specific event
    const eventId = process.argv[2];
    if (!eventId) {
      console.log('❌ Please provide an event ID as an argument');
      console.log('Usage: node testCertificates.js <eventId>');
      process.exit(1);
    }

    console.log(`🎖️ Testing certificate generation for event ID: ${eventId}`);
    
    const certificates = await generateEventCertificates(parseInt(eventId));
    
    console.log(`✅ Successfully generated ${certificates.length} certificates`);
    console.log('📋 Certificate details:');
    
    certificates.forEach((cert, index) => {
      console.log(`  ${index + 1}. ${cert.title} - ${cert.certificateNumber}`);
      console.log(`     User ID: ${cert.userId}, Team ID: ${cert.teamId || 'N/A'}`);
      console.log(`     PDF URL: ${cert.pdfUrl}`);
    });

    console.log('\n🎉 Certificate generation test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    process.exit(0);
  }
}

// Run the test
testCertificateGeneration();
