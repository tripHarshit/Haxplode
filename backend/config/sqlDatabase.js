const { Sequelize } = require('sequelize');

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
    if (process.env.NODE_ENV === 'development') {
      try {
        // Only sync if tables don't exist - NEVER force sync in development
        await sequelize.sync({ alter: false });
        console.log('✅ Database models synchronized safely.');
      } catch (syncError) {
        console.warn('⚠️  Model sync failed:', syncError.message);
        console.warn('⚠️  Continuing without sync - ensure tables exist manually');
        console.warn('⚠️  If you need to reset the database, do it manually in Azure Portal');
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
