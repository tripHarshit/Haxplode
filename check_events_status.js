require('dotenv').config();
const { connectSQL } = require('./backend/config/sqlDatabase');
require('./backend/models/sql');

async function checkEventsStatus() {
  try {
    console.log('🔍 Connecting to database...');
    await connectSQL();
    console.log('✅ Database connected');
    
    const { Event } = require('./backend/models/sql');
    
    console.log('🔍 Checking events status in database...');
    
    const events = await Event.findAll({
      attributes: ['id', 'name', 'status', 'createdAt', 'createdBy'],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`📊 Found ${events.length} events in database:`);
    
    events.forEach(event => {
      console.log(`   - ID: ${event.id}, Name: "${event.name}", Status: "${event.status}", Created: ${event.createdAt}`);
    });
    
    // Count by status
    const statusCounts = {};
    events.forEach(event => {
      statusCounts[event.status] = (statusCounts[event.status] || 0) + 1;
    });
    
    console.log('\n📈 Status distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   - ${status}: ${count} events`);
    });
    
    // If there are Draft events, offer to update them
    if (statusCounts['Draft'] > 0) {
      console.log('\n🔄 Found Draft events. Would you like to update them to Published?');
      console.log('   Run: node update_draft_events.js');
    }
    
  } catch (error) {
    console.error('❌ Error checking events:', error);
  }
}

checkEventsStatus();
