const User = require('./User');
const Event = require('./Event');
const { Team, TeamMember } = require('./Team');
const { Judge, JudgeEventAssignment, JudgeSubmissionAssignment } = require('./Judge');
const Sponsor = require('./Sponsor');
const Certificate = require('./Certificate');

// User associations
User.hasMany(Event, { foreignKey: 'createdBy', as: 'createdEvents' });
User.hasMany(TeamMember, { foreignKey: 'userId', as: 'teamMemberships' });
User.hasOne(Judge, { foreignKey: 'userId', as: 'judgeProfile' });
User.hasMany(Certificate, { foreignKey: 'userId', as: 'certificates' });

// Event associations
Event.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Event.hasMany(Team, { foreignKey: 'eventId', as: 'teams' });
Event.hasMany(JudgeEventAssignment, { foreignKey: 'eventId', as: 'judgeAssignments' });
Event.hasMany(Certificate, { foreignKey: 'eventId', as: 'certificates' });

// Sponsor associations
User.hasMany(Sponsor, { foreignKey: 'organizerId', as: 'sponsors' });
Sponsor.belongsTo(User, { foreignKey: 'organizerId', as: 'organizer' });

// Team associations
Team.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
Team.hasMany(TeamMember, { foreignKey: 'teamId', as: 'members' });
Team.belongsTo(User, { foreignKey: 'mentorId', as: 'mentor' });
Team.hasMany(Certificate, { foreignKey: 'teamId', as: 'certificates' });

// TeamMember associations
TeamMember.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });
TeamMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Judge associations
Judge.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Judge.hasMany(JudgeEventAssignment, { foreignKey: 'judgeId', as: 'eventAssignments' });
Judge.hasMany(JudgeSubmissionAssignment, { foreignKey: 'judgeId', as: 'submissionAssignments' });

// JudgeEventAssignment associations
JudgeEventAssignment.belongsTo(Judge, { foreignKey: 'judgeId', as: 'judge' });
JudgeEventAssignment.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

// JudgeSubmissionAssignment associations
JudgeSubmissionAssignment.belongsTo(Judge, { foreignKey: 'judgeId', as: 'judge' });
JudgeSubmissionAssignment.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

// Certificate associations
Certificate.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Certificate.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
Certificate.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

module.exports = {
  User,
  Event,
  Team,
  TeamMember,
  Judge,
  JudgeEventAssignment,
  Sponsor,
  Certificate,
  JudgeSubmissionAssignment,
};
