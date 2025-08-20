const { Sequelize } = require('sequelize');

console.log("🔍 DB Host:", process.env.AZURE_SQL_SERVER);
console.log("🔍 DB Name:", process.env.AZURE_SQL_DATABASE);
console.log("🔍 DB User:", process.env.AZURE_SQL_USERNAME);

const shouldEncrypt = process.env.AZURE_SQL_OPTIONS_ENCRYPT !== 'false';
const shouldTrustServerCertificate = process.env.AZURE_SQL_OPTIONS_TRUST_SERVER_CERTIFICATE === 'true';

const sequelize = new Sequelize({
  dialect: 'mssql',
  host: process.env.AZURE_SQL_SERVER,
  port: process.env.AZURE_SQL_PORT || 1433,
  database: process.env.AZURE_SQL_DATABASE,
  username: process.env.AZURE_SQL_USERNAME,
  password: process.env.AZURE_SQL_PASSWORD,
  dialectOptions: {
    options: {
      // Default to encryption unless explicitly disabled via env var
      encrypt: shouldEncrypt,
      // Default to NOT trusting the server certificate unless explicitly enabled
      trustServerCertificate: shouldTrustServerCertificate,
      requestTimeout: 30000,
      connectionTimeout: 30000,
    },
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true,
  },
});

async function connectSQL() {
  try {
    await sequelize.authenticate();
    console.log('✅ Azure SQL Database connection established successfully.');
    
    // Sync models (in production, use migrations instead)
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('🔄 Starting database sync...');
        
        // Force sync to ensure all tables are created (WARNING: This will drop existing tables in development)
        // Use alter: true for production-like behavior
        await sequelize.sync({ alter: true, force: false });
        
        console.log('✅ Database models synchronized successfully.');
        
        // Verify critical tables exist
        const tables = await sequelize.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'", { type: sequelize.QueryTypes.SELECT });
        console.log('📋 Available tables:', tables.map(t => t.TABLE_NAME));
        
      } catch (syncError) {
        console.error('❌ Model sync failed:', syncError.message);
        console.error('❌ Sync error details:', syncError);
        
        // Try to create just the Certificate table manually if sync fails
        try {
          console.log('🔄 Attempting to create Certificate table manually...');
          await sequelize.query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Certificates' AND xtype='U')
            CREATE TABLE [Certificates] (
              [id] INT IDENTITY(1,1) PRIMARY KEY,
              [userId] INT NOT NULL,
              [eventId] INT NOT NULL,
              [teamId] INT NULL,
              [type] VARCHAR(50) NOT NULL DEFAULT 'participation',
              [title] VARCHAR(200) NOT NULL,
              [description] TEXT NULL,
              [projectName] VARCHAR(200) NULL,
              [score] DECIMAL(5,2) NULL,
              [rank] INT NULL,
              [issuedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
              [certificateNumber] VARCHAR(50) NOT NULL UNIQUE,
              [pdfUrl] VARCHAR(500) NULL,
              [metadata] TEXT NULL,
              [createdAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
              [updatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
            )
          `);
          console.log('✅ Certificate table created manually');
        } catch (manualCreateError) {
          console.error('❌ Failed to create Certificate table manually:', manualCreateError.message);
        }
        
        console.warn('⚠️  Continuing without full sync - some features may not work');
      }
    }
  } catch (error) {
    console.error('❌ Unable to connect to Azure SQL Database:', error);
    if (error && (error.code === 'EENCRYPT' || error.parent?.code === 'EENCRYPT')) {
      console.error('ℹ️ Tip: Azure SQL requires TLS. Ensure encryption is enabled.');
      console.error("Set AZURE_SQL_OPTIONS_ENCRYPT to 'true' (default). Only set TRUST_SERVER_CERTIFICATE to 'true' for testing.");
    }
    throw error;
  }
}

module.exports = {
  sequelize,
  connectSQL,
};
