// Import all SQL models
const User = require('./User');
const Event = require('./Event');
const { Team, TeamMember } = require('./Team');
const { Judge, JudgeEventAssignment } = require('./Judge');
const Sponsor = require('./Sponsor');
const Certificate = require('./Certificate');

// Import associations
require('./associations');

module.exports = {
  User,
  Event,
  Team,
  TeamMember,
  Judge,
  JudgeEventAssignment,
  Sponsor,
  Certificate,
};
