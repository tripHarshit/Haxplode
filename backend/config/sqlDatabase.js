const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'mssql',
  host: process.env.AZURE_SQL_SERVER,
  port: process.env.AZURE_SQL_PORT || 1433,
  database: process.env.AZURE_SQL_DATABASE,
  username: process.env.AZURE_SQL_USERNAME,
  password: process.env.AZURE_SQL_PASSWORD,
  dialectOptions: {
    options: {
      encrypt: process.env.AZURE_SQL_OPTIONS_ENCRYPT === 'true',
      trustServerCertificate: process.env.AZURE_SQL_OPTIONS_TRUST_SERVER_CERTIFICATE === 'true',
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
        await sequelize.sync({ alter: true });
        console.log('✅ Database models synchronized.');
      } catch (syncError) {
        console.warn('⚠️  Model sync failed, trying force sync...');
        try {
          await sequelize.sync({ force: true });
          console.log('✅ Database models force synchronized.');
        } catch (forceSyncError) {
          console.error('❌ Force sync also failed:', forceSyncError.message);
          console.warn('⚠️  Continuing without sync - ensure tables exist manually');
        }
      }
    }
  } catch (error) {
    console.error('❌ Unable to connect to Azure SQL Database:', error);
    throw error;
  }
}

module.exports = {
  sequelize,
  connectSQL,
};
