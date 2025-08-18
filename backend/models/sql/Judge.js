const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/sqlDatabase');

const Judge = sequelize.define('Judge', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  expertise: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    validate: {
      isValidExpertise(value) {
        if (!Array.isArray(value)) {
          throw new Error('Expertise must be an array');
        }
      },
    },
    get() {
      const rawValue = this.getDataValue('expertise');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('expertise', JSON.stringify(value));
    },
  },
  bio: {
    type: DataTypes.TEXT,
  },
  yearsOfExperience: {
    type: DataTypes.INTEGER,
    validate: {
      min: 0,
      max: 50,
    },
  },
  company: {
    type: DataTypes.STRING(200),
  },
  position: {
    type: DataTypes.STRING(200),
  },
  linkedinProfile: {
    type: DataTypes.STRING(500),
  },
  githubProfile: {
    type: DataTypes.STRING(500),
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00,
    validate: {
      min: 0,
      max: 5,
    },
  },
  totalJudgements: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'Judges',
  timestamps: true,
  indexes: [
    {
      fields: ['userId'],
    },
    {
      fields: ['isActive'],
    },
  ],
});

// JudgeEventAssignment junction table for many-to-many relationship
const JudgeEventAssignment = sequelize.define('JudgeEventAssignment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  judgeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Judges',
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
  assignedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  role: {
    type: DataTypes.ENUM('Primary', 'Secondary', 'Mentor'),
    defaultValue: 'Secondary',
  },
}, {
  tableName: 'JudgeEventAssignments',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['judgeId', 'eventId'],
    },
  ],
});

module.exports = {
  Judge,
  JudgeEventAssignment,
};
