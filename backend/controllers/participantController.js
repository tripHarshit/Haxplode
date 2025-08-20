const { Registration, Submission } = require('../models/mongo');
const { Team, TeamMember } = require('../models/sql/Team');
const Event = require('../models/sql/Event');
const User = require('../models/sql/User');

async function getDashboardData(req, res) {
  try {
    const userId = req.currentUser.id;
    const regCount = await Registration.countDocuments({ userId });
    const teams = await Team.findAll({
      include: [{ model: TeamMember, as: 'members', where: { userId } }],
    });
    const teamIds = teams.map(t => t.id);
    const submissionsCount = await Submission.countDocuments({ teamId: { $in: teamIds } });
    return res.json({
      eventsRegistered: regCount,
      teamsCount: teams.length,
      submissionsCount,
    });
  } catch (err) {
    console.error('Participant dashboard error:', err);
    return res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
}

async function getRegisteredEvents(req, res) {
  try {
    const userId = req.currentUser.id;
    // Determine registered events from the user's actual SQL team memberships
    const myMemberships = await TeamMember.findAll({ attributes: ['teamId'], where: { userId } });
    const teamIds = myMemberships.map(m => m.teamId);
    if (teamIds.length === 0) {
      return res.json({ events: [] });
    }
    const teams = await Team.findAll({
      where: { id: teamIds },
      include: [{ model: Event, as: 'event' }],
    });
    const uniqueEventsMap = new Map();
    for (const t of teams) {
      if (t.event) uniqueEventsMap.set(t.event.id, t.event);
    }
    const events = Array.from(uniqueEventsMap.values());
    return res.json({ events });
  } catch (err) {
    console.error('Participant registered events error:', err);
    return res.status(500).json({ message: 'Failed to fetch registered events' });
  }
}

async function getParticipantTeams(req, res) {
  try {
    const userId = req.currentUser.id;

    // First find teamIds where the current user is a member
    const myMemberships = await TeamMember.findAll({
      attributes: ['teamId'],
      where: { userId },
    });
    const teamIds = myMemberships.map(m => m.teamId);

    if (teamIds.length === 0) {
      return res.json({ teams: [] });
    }

    // Then fetch full teams with all members (expanded with user) and event info
    const teams = await Team.findAll({
      where: { id: teamIds },
      include: [
        {
          model: TeamMember,
          as: 'members',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'fullName', 'email', 'profilePicture'],
            },
          ],
        },
        { 
          model: Event, 
          as: 'event', 
          attributes: ['id', 'name', 'status', 'timeline', 'maxTeamSize'] 
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.json({ teams });
  } catch (err) {
    console.error('Participant teams error:', err);
    return res.status(500).json({ message: 'Failed to fetch teams' });
  }
}

async function getParticipantSubmissions(req, res) {
  try {
    const userId = req.currentUser.id;
    const teams = await Team.findAll({ include: [{ model: TeamMember, as: 'members', where: { userId } }] });
    const teamIds = teams.map(t => t.id);
    const submissions = await Submission.find({ teamId: { $in: teamIds } }).sort({ submissionDate: -1 });
    return res.json({ submissions });
  } catch (err) {
    console.error('Participant submissions error:', err);
    return res.status(500).json({ message: 'Failed to fetch submissions' });
  }
}

async function getActivities(req, res) {
  try {
    // Minimal stub: derive activities from registrations and submissions dates
    const userId = req.currentUser.id;
    const regs = await Registration.find({ userId }).sort({ registeredAt: -1 }).limit(20);
    const teams = await Team.findAll({ include: [{ model: TeamMember, as: 'members', where: { userId } }] });
    const teamIds = teams.map(t => t.id);
    const subs = await Submission.find({ teamId: { $in: teamIds } }).sort({ submissionDate: -1 }).limit(20);
    const activities = [
      ...regs.map(r => ({ type: 'event_registered', eventId: r.eventId, ts: r.registeredAt })),
      ...subs.map(s => ({ type: 'submission_created', eventId: s.eventId, teamId: s.teamId, ts: s.submissionDate })),
    ].sort((a, b) => new Date(b.ts) - new Date(a.ts));
    return res.json({ activities });
  } catch (err) {
    console.error('Participant activities error:', err);
    return res.status(500).json({ message: 'Failed to fetch activities' });
  }
}

async function getDeadlines(req, res) {
  try {
    const userId = req.currentUser.id;
    const regs = await Registration.find({ userId });
    const eventIds = regs.map(r => r.eventId);
    const events = await Event.findAll({ where: { id: eventIds } });
    const deadlines = events.map(e => ({
      eventId: e.id,
      registrationDeadline: e.timeline?.registrationDeadline || null,
      endDate: e.timeline?.endDate || null,
    }));
    return res.json({ deadlines });
  } catch (err) {
    console.error('Participant deadlines error:', err);
    return res.status(500).json({ message: 'Failed to fetch deadlines' });
  }
}

module.exports = {
  getDashboardData,
  getRegisteredEvents,
  getParticipantTeams,
  getParticipantSubmissions,
  getActivities,
  getDeadlines,
};


