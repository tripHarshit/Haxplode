const User = require('./User');
const Event = require('./Event');
const { Team, TeamMember } = require('./Team');
const { Judge, JudgeEventAssignment } = require('./Judge');

// User associations
User.hasMany(Event, { foreignKey: 'createdBy', as: 'createdEvents' });
User.hasMany(TeamMember, { foreignKey: 'userId', as: 'teamMemberships' });
User.hasOne(Judge, { foreignKey: 'userId', as: 'judgeProfile' });

// Event associations
Event.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Event.hasMany(Team, { foreignKey: 'eventId', as: 'teams' });
Event.hasMany(JudgeEventAssignment, { foreignKey: 'eventId', as: 'judgeAssignments' });

// Team associations
Team.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
Team.hasMany(TeamMember, { foreignKey: 'teamId', as: 'members' });
Team.belongsTo(User, { foreignKey: 'mentorId', as: 'mentor' });

// TeamMember associations
TeamMember.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });
TeamMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Judge associations
Judge.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Judge.hasMany(JudgeEventAssignment, { foreignKey: 'judgeId', as: 'eventAssignments' });

// JudgeEventAssignment associations
JudgeEventAssignment.belongsTo(Judge, { foreignKey: 'judgeId', as: 'judge' });
JudgeEventAssignment.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

module.exports = {
  User,
  Event,
  Team,
  TeamMember,
  Judge,
  JudgeEventAssignment,
};
