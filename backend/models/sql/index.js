// Import all SQL models
const User = require('./User');
const Event = require('./Event');
const { Team, TeamMember } = require('./Team');
const { Judge, JudgeEventAssignment, JudgeSubmissionAssignment } = require('./Judge');
const Sponsor = require('./Sponsor');
const Certificate = require('./Certificate');
const { sequelize } = require('../../config/sqlDatabase');

// Import associations
require('./associations');

module.exports = {
  User,
  Event,
  Team,
  TeamMember,
  Judge,
  JudgeEventAssignment,
  JudgeSubmissionAssignment,
  Sponsor,
  Certificate,
  sequelize,
};
