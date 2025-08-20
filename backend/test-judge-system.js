const { Judge, JudgeEventAssignment, JudgeSubmissionAssignment, User, Event } = require('./models/sql');
const Submission = require('./models/mongo/Submission');
const { sequelize } = require('./config/sqlDatabase');

async function testJudgeSystem() {
  try {
    console.log('🧪 Testing Judge Submission Assignment System...');
    
    // Test 1: Check if tables exist
    console.log('\n1. Checking if required tables exist...');
    const tables = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME IN ('Judges', 'JudgeEventAssignments', 'JudgeSubmissionAssignments')
      ORDER BY TABLE_NAME
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('Found tables:', tables.map(t => t.TABLE_NAME));
    
    // Test 2: Check if models are properly exported
    console.log('\n2. Checking model exports...');
    console.log('Judge model:', typeof Judge);
    console.log('JudgeEventAssignment model:', typeof JudgeEventAssignment);
    console.log('JudgeSubmissionAssignment model:', typeof JudgeSubmissionAssignment);
    
    // Test 3: Check associations
    console.log('\n3. Checking associations...');
    console.log('Judge associations:', Object.keys(Judge.associations || {}));
    console.log('JudgeEventAssignment associations:', Object.keys(JudgeEventAssignment.associations || {}));
    console.log('JudgeSubmissionAssignment associations:', Object.keys(JudgeSubmissionAssignment.associations || {}));
    
    // Test 4: Check if we can query the tables
    console.log('\n4. Testing basic queries...');
    try {
      const judgeCount = await Judge.count();
      console.log('Judge count:', judgeCount);
    } catch (error) {
      console.error('Error querying Judges table:', error.message);
    }
    
    try {
      const assignmentCount = await JudgeEventAssignment.count();
      console.log('JudgeEventAssignment count:', assignmentCount);
    } catch (error) {
      console.error('Error querying JudgeEventAssignments table:', error.message);
    }
    
    try {
      const submissionAssignmentCount = await JudgeSubmissionAssignment.count();
      console.log('JudgeSubmissionAssignment count:', submissionAssignmentCount);
    } catch (error) {
      console.error('Error querying JudgeSubmissionAssignments table:', error.message);
    }
    
    // Test 5: Check MongoDB connection
    console.log('\n5. Testing MongoDB connection...');
    try {
      const submissionCount = await Submission.countDocuments();
      console.log('Submission count:', submissionCount);
    } catch (error) {
      console.error('Error querying MongoDB Submissions:', error.message);
    }
    
    // Test 6: Check if we can create a test record
    console.log('\n6. Testing record creation...');
    try {
      // Try to create a test record (we'll delete it immediately)
      const testRecord = await JudgeSubmissionAssignment.create({
        judgeId: 999999, // Use a non-existent ID
        submissionId: 'test123',
        eventId: 999999, // Use a non-existent ID
        status: 'assigned'
      });
      console.log('Test record created successfully');
      
      // Delete the test record
      await testRecord.destroy();
      console.log('Test record deleted successfully');
    } catch (error) {
      console.error('Error creating test record:', error.message);
      console.error('This might indicate a table structure issue');
    }
    
    console.log('\n✅ All tests completed! Check the output above for any issues.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error stack:', error.stack);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

testJudgeSystem();
