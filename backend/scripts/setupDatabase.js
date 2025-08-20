const { sequelize } = require('../config/sqlDatabase');

async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...');
    
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Create JudgeSubmissionAssignments (MSSQL compatible)
    console.log('🔄 Ensuring JudgeSubmissionAssignments exists...');
    await sequelize.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='JudgeSubmissionAssignments' AND xtype='U')
      CREATE TABLE [JudgeSubmissionAssignments] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [judgeId] INT NOT NULL,
        [submissionId] VARCHAR(255) NOT NULL,
        [eventId] INT NOT NULL,
        [assignedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [reviewedAt] DATETIME2 NULL,
        [status] VARCHAR(20) NOT NULL DEFAULT 'assigned',
        [score] DECIMAL(5,2) NULL,
        [feedback] NVARCHAR(MAX) NULL,
        [criteria] NVARCHAR(MAX) NULL,
        [createdAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [updatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
      );
      IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'UQ_JudgeSubmission')
        CREATE UNIQUE INDEX [UQ_JudgeSubmission] ON [JudgeSubmissionAssignments]([judgeId], [submissionId]);
      IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'IX_Event_Status')
        CREATE INDEX [IX_Event_Status] ON [JudgeSubmissionAssignments]([eventId], [status]);
      IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'IX_Judge_Status')
        CREATE INDEX [IX_Judge_Status] ON [JudgeSubmissionAssignments]([judgeId], [status]);
    `);
    console.log('✅ JudgeSubmissionAssignments table ensured');

    // Keep existing Certificate table ensure below
    const tableExists = await sequelize.query(`
      SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Certificates'
    `, { type: sequelize.QueryTypes.SELECT });
    if (tableExists[0].count === 0) {
      console.log('🔄 Creating Certificate table...');
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
    } else {
      console.log('✅ Certificate table already exists');
    }

    const tables = await sequelize.query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME
    `, { type: sequelize.QueryTypes.SELECT });
    console.log('📋 Available tables:', tables.map(t => t.TABLE_NAME));

    console.log('✅ Database setup completed successfully');
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

setupDatabase();
