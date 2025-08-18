const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/sqlDatabase');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      len: [3, 200],
      notEmpty: true,
    },
  },
  theme: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  rules: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  timeline: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      isValidTimeline(value) {
        if (!value.startDate || !value.endDate || !value.registrationDeadline) {
          throw new Error('Timeline must include startDate, endDate, and registrationDeadline');
        }
      },
    },
    get() {
      const rawValue = this.getDataValue('timeline');
      return rawValue ? JSON.parse(rawValue) : null;
    },
    set(value) {
      this.setDataValue('timeline', JSON.stringify(value));
    },
  },
  prizes: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      isValidPrizes(value) {
        if (!Array.isArray(value) || value.length === 0) {
          throw new Error('Prizes must be a non-empty array');
        }
      },
    },
    get() {
      const rawValue = this.getDataValue('prizes');
      return rawValue ? JSON.parse(rawValue) : null;
    },
    set(value) {
      this.setDataValue('prizes', JSON.stringify(value));
    },
  },
  sponsors: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const rawValue = this.getDataValue('sponsors');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('sponsors', JSON.stringify(value));
    },
  },
  maxTeamSize: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 4,
    validate: {
      min: 1,
      max: 10,
    },
  },
  maxTeams: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 50,
    validate: {
      min: 1,
    },
  },
  registrationFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    validate: {
      min: 0,
    },
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Published', 'Registration Open', 'Registration Closed', 'In Progress', 'Completed', 'Cancelled'),
    defaultValue: 'Draft',
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  tags: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const rawValue = this.getDataValue('tags');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('tags', JSON.stringify(value));
    },
  },
  coverImage: {
    type: DataTypes.STRING(500),
  },
  location: {
    type: DataTypes.STRING(200),
  },
  isVirtual: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  virtualMeetingLink: {
    type: DataTypes.STRING(500),
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
}, {
  tableName: 'Events',
  timestamps: true,
  indexes: [
    {
      fields: ['status'],
    },
    {
      fields: ['isPublic'],
    },
    {
      fields: ['createdBy'],
    },
  ],
});

module.exports = Event;
