require('dotenv').config();
const { connectSQL } = require('../config/sqlDatabase');
const { connectMongo } = require('../models/mongo');
const { Certificate, User, Event, Team } = require('../models/sql');

async function setupCertificates() {
  try {
    console.log('🔌 Connecting to databases...');
    await connectSQL();
    await connectMongo();
    console.log('✅ Connected to databases');

    // Check if Certificate table exists and has data
    console.log('\n🔍 Checking Certificate table...');
    
    try {
      const tableExists = await Certificate.count();
      console.log(`✅ Certificate table exists with ${tableExists} records`);
      
      if (tableExists === 0) {
        console.log('📝 Table is empty, creating test data...');
        await createTestCertificates();
      } else {
        console.log('📋 Existing certificates:');
        const certificates = await Certificate.findAll({
          include: [
            { model: User, as: 'user', attributes: ['fullName', 'email'] },
            { model: Event, as: 'event', attributes: ['name'] },
            { model: Team, as: 'team', attributes: ['teamName'] }
          ],
          limit: 5
        });
        
        certificates.forEach((cert, index) => {
          console.log(`  ${index + 1}. ${cert.title} - ${cert.certificateNumber}`);
          console.log(`     User: ${cert.user?.fullName || 'N/A'}`);
          console.log(`     Event: ${cert.event?.name || 'N/A'}`);
          console.log(`     Team: ${cert.team?.teamName || 'N/A'}`);
        });
      }
      
    } catch (error) {
      console.error('❌ Error checking Certificate table:', error.message);
      console.log('🔧 Creating Certificate table...');
      await createCertificateTable();
      await createTestCertificates();
    }

    console.log('\n🎉 Certificate setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    process.exit(0);
  }
}

async function createCertificateTable() {
  try {
    console.log('🔧 Creating Certificate table...');
    
    // This will create the table if it doesn't exist
    await Certificate.sync({ force: false });
    console.log('✅ Certificate table created/verified');
    
  } catch (error) {
    console.error('❌ Failed to create table:', error.message);
    throw error;
  }
}

async function createTestCertificates() {
  try {
    console.log('📝 Creating test certificates...');
    
    // Get some existing users, events, and teams
    const users = await User.findAll({ limit: 3 });
    const events = await Event.findAll({ limit: 2 });
    const teams = await Team.findAll({ limit: 2 });
    
    if (users.length === 0) {
      console.log('⚠️ No users found, skipping test certificate creation');
      return;
    }
    
    if (events.length === 0) {
      console.log('⚠️ No events found, skipping test certificate creation');
      return;
    }
    
    const testCertificates = [
      {
        userId: users[0].id,
        eventId: events[0].id,
        teamId: teams.length > 0 ? teams[0].id : null,
        type: 'participation',
        title: 'Certificate of Participation',
        description: 'Successfully participated in the hackathon',
        projectName: 'Test Project Alpha',
        score: 85.5,
        rank: 1,
        issuedAt: new Date(),
        certificateNumber: `CERT-${Date.now()}-PART-001`,
        pdfUrl: '/uploads/certificates/test1.pdf',
        metadata: JSON.stringify({ category: 'participation', eventType: 'hackathon' })
      },
      {
        userId: users[1]?.id || users[0].id,
        eventId: events[0].id,
        teamId: teams.length > 1 ? teams[1].id : null,
        type: 'winner',
        title: 'First Place Winner',
        description: 'Achieved first place in the hackathon',
        projectName: 'Test Project Beta',
        score: 95.0,
        rank: 1,
        issuedAt: new Date(),
        certificateNumber: `CERT-${Date.now()}-WIN-001`,
        pdfUrl: '/uploads/certificates/test2.pdf',
        metadata: JSON.stringify({ category: 'winner', eventType: 'hackathon', prize: 'First Place' })
      }
    ];
    
    for (const certData of testCertificates) {
      try {
        const certificate = await Certificate.create(certData);
        console.log(`✅ Created certificate: ${certificate.title} - ${certificate.certificateNumber}`);
      } catch (error) {
        console.log(`⚠️ Failed to create certificate: ${certData.title} - ${error.message}`);
      }
    }
    
    console.log('✅ Test certificates created');
    
  } catch (error) {
    console.error('❌ Failed to create test certificates:', error.message);
    throw error;
  }
}

// Run the setup
setupCertificates();
