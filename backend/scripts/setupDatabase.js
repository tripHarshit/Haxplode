const { sequelize } = require('../config/sqlDatabase');

async function setupDatabase() {
  try {
    console.log('🔄 Setting up database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Check if Certificate table exists
    const tableExists = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'Certificates'
    `, { type: sequelize.QueryTypes.SELECT });
    
    if (tableExists[0].count > 0) {
      console.log('✅ Certificate table already exists');
    } else {
      console.log('🔄 Creating Certificate table...');
      
      // Create Certificate table
      await sequelize.query(`
        CREATE TABLE [Certificates] (
          [id] INT IDENTITY(1,1) PRIMARY KEY,
          [userId] INT NOT NULL,
          [eventId] INT NOT NULL,
          [teamId] INT NULL,
          [type] VARCHAR(50) NOT NULL DEFAULT 'participation',
          [title] VARCHAR(200) NOT NULL,
          [description] NVARCHAR(MAX) NULL,
          [projectName] VARCHAR(200) NULL,
          [score] DECIMAL(5,2) NULL,
          [rank] INT NULL,
          [issuedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
          [certificateNumber] VARCHAR(50) NOT NULL UNIQUE,
          [pdfUrl] VARCHAR(500) NULL,
          [metadata] NVARCHAR(MAX) NULL,
          [createdAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
          [updatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
        )
      `);
      
      console.log('✅ Certificate table created successfully');
      
      // Create indexes
      await sequelize.query(`
        CREATE INDEX [IX_Certificates_userId] ON [Certificates] ([userId]);
        CREATE INDEX [IX_Certificates_eventId] ON [Certificates] ([eventId]);
        CREATE INDEX [IX_Certificates_type] ON [Certificates] ([type]);
        CREATE UNIQUE INDEX [IX_Certificates_certificateNumber] ON [Certificates] ([certificateNumber]);
      `);
      
      console.log('✅ Certificate table indexes created');
    }
    
    // List all tables
    const tables = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('📋 Available tables:');
    tables.forEach(table => {
      console.log(`  - ${table.TABLE_NAME}`);
    });
    
    console.log('✅ Database setup completed successfully');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    console.error('Error details:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

setupDatabase();
