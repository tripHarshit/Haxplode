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
        // value can be either an object or a JSON string
        let timelineObj;
        if (typeof value === 'string') {
          try {
            timelineObj = JSON.parse(value);
          } catch (parseError) {
            throw new Error('Timeline must be valid JSON with startDate, endDate, and registrationDeadline');
          }
        } else {
          timelineObj = value;
        }
        
        if (!timelineObj || !timelineObj.startDate || !timelineObj.endDate || !timelineObj.registrationDeadline) {
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
        // value can be either an array or a JSON string
        let prizesArray;
        if (typeof value === 'string') {
          try {
            prizesArray = JSON.parse(value);
          } catch (parseError) {
            throw new Error('Prizes must be valid JSON array');
          }
        } else {
          prizesArray = value;
        }
        
        if (!Array.isArray(prizesArray) || prizesArray.length === 0) {
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
  tracks: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const raw = this.getDataValue('tracks');
      return raw ? JSON.parse(raw) : [];
    },
    set(value) {
      this.setDataValue('tracks', JSON.stringify(value || []));
    },
  },
  rounds: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const raw = this.getDataValue('rounds');
      return raw ? JSON.parse(raw) : [];
    },
    set(value) {
      this.setDataValue('rounds', JSON.stringify(value || []));
    },
  },
  customCriteria: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const raw = this.getDataValue('customCriteria');
      return raw ? JSON.parse(raw) : [];
    },
    set(value) {
      this.setDataValue('customCriteria', JSON.stringify(value || []));
    },
  },
  settings: {
    type: DataTypes.TEXT,
    defaultValue: '{}',
    get() {
      const raw = this.getDataValue('settings');
      return raw ? JSON.parse(raw) : {};
    },
    set(value) {
      this.setDataValue('settings', JSON.stringify(value || {}));
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
