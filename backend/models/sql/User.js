const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../../config/sqlDatabase');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fullName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [2, 100],
      notEmpty: true,
    },
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true,
    },
  },
  role: {
    type: DataTypes.ENUM('Participant', 'Organizer', 'Judge'),
    allowNull: false,
    defaultValue: 'Participant',
    validate: {
      isIn: [['Participant', 'Organizer', 'Judge']],
    },
  },
  dob: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true,
      isPast(value) {
        if (value >= new Date()) {
          throw new Error('Date of birth must be in the past');
        }
      },
    },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [8, 255],
    },
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  lastLoginAt: {
    type: DataTypes.DATE,
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  profilePicture: {
    type: DataTypes.STRING(500),
  },
  socialLogin: {
    type: DataTypes.TEXT,
    defaultValue: '{}',
    get() {
      const rawValue = this.getDataValue('socialLogin');
      return rawValue ? JSON.parse(rawValue) : {};
    },
    set(value) {
      this.setDataValue('socialLogin', JSON.stringify(value));
    },
  },
  bio: {
    type: DataTypes.TEXT,
  },
  githubUsername: {
    type: DataTypes.STRING(100),
  },
  linkedinProfile: {
    type: DataTypes.STRING(500),
  },
}, {
  tableName: 'Users',
  timestamps: true,
  hooks: {
    // Temporarily disabled password hashing for testing
    // beforeCreate: async (user) => {
    //   if (user.password) {
    //     user.password = await bcrypt.hash(user.password, 12);
    //   }
    // },
    // beforeUpdate: async (user) => {
    //   if (user.changed('password')) {
    //     user.password = await bcrypt.hash(user.password, 12);
    //   }
    // },
  },
});

// Instance methods
User.prototype.comparePassword = async function(candidatePassword) {
  // Temporarily using simple string comparison for testing
  return candidatePassword === this.password;
  // return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password;
  return values;
};

module.exports = User;
