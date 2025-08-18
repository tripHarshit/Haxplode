const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/sqlDatabase');

const Team = sequelize.define('Team', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  teamName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [2, 100],
      notEmpty: true,
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
  description: {
    type: DataTypes.TEXT,
  },
  projectName: {
    type: DataTypes.STRING(200),
  },
  projectDescription: {
    type: DataTypes.TEXT,
  },
  githubRepository: {
    type: DataTypes.STRING(500),
  },
  projectVideo: {
    type: DataTypes.STRING(500),
  },
  projectDocumentation: {
    type: DataTypes.STRING(500),
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive', 'Disqualified'),
    defaultValue: 'Active',
  },
  isRegistered: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  registrationDate: {
    type: DataTypes.DATE,
  },
  teamLogo: {
    type: DataTypes.STRING(500),
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
  mentorId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
}, {
  tableName: 'Teams',
  timestamps: true,
  indexes: [
    {
      fields: ['eventId'],
    },
    {
      fields: ['teamName'],
    },
    {
      fields: ['status'],
    },
  ],
});

// TeamMember junction table for many-to-many relationship
const TeamMember = sequelize.define('TeamMember', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Teams',
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  role: {
    type: DataTypes.ENUM('Leader', 'Member'),
    defaultValue: 'Member',
  },
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'TeamMembers',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['teamId', 'userId'],
    },
  ],
});

module.exports = {
  Team,
  TeamMember,
};
