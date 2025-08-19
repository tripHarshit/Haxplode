const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/sqlDatabase');

const Sponsor = sequelize.define('Sponsor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  organizerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  logo: {
    type: DataTypes.STRING(500),
  },
  tier: {
    type: DataTypes.ENUM('platinum', 'gold', 'silver', 'bronze', 'community'),
    defaultValue: 'bronze',
  },
  website: {
    type: DataTypes.STRING(500),
  },
  description: {
    type: DataTypes.TEXT,
  },
  contribution: {
    type: DataTypes.STRING(100),
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'Sponsors',
  timestamps: true,
  indexes: [
    { fields: ['organizerId'] },
    { fields: ['tier'] },
  ],
});

module.exports = Sponsor;


