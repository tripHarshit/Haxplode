const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/sqlDatabase');

const Certificate = sequelize.define('Certificate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  eventId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Events',
      key: 'id',
    },
  },
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Teams',
      key: 'id',
    },
  },
  type: {
    type: DataTypes.ENUM('participation', 'winner', 'runner-up', 'special', 'honorable-mention'),
    allowNull: false,
    defaultValue: 'participation',
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  projectName: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
  },
  rank: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  issuedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  certificateNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  pdfUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  metadata: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('metadata');
      return rawValue ? JSON.parse(rawValue) : {};
    },
    set(value) {
      this.setDataValue('metadata', JSON.stringify(value));
    },
  },
}, {
  tableName: 'Certificates',
  timestamps: true,
  indexes: [
    {
      fields: ['userId'],
    },
    {
      fields: ['eventId'],
    },
    {
      fields: ['type'],
    },
    {
      fields: ['certificateNumber'],
      unique: true,
    },
  ],
});

module.exports = Certificate;
