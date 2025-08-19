const { Team, TeamMember } = require('../models/sql/Team');
const Event = require('../models/sql/Event');
const User = require('../models/sql/User');
const { TeamInvitation } = require('../models/mongo');
const crypto = require('crypto');
const { emitToRoom } = require('../utils/socket');
const { audit } = require('../utils/audit');

// Create team (Participant only)
const createTeam = async (req, res) => {
  try {
    const {
      teamName,
      eventId,
      description,
      projectName,
      projectDescription,
      githubRepository,
      projectVideo,
      projectDocumentation,
      tags,
    } = req.body;

    const leaderId = req.currentUser.id;

    // Check if event exists and registration is open
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Enforce team creation settings and capacity
    const eventSettings = event.settings || {};
    if (eventSettings.allowTeams === false) {
      return res.status(400).json({ success: false, message: 'Team creation is disabled for this event' });
    }
    const teamCount = await Team.count({ where: { eventId } });
    if (typeof event.maxTeams === 'number' && teamCount >= event.maxTeams) {
      return res.status(400).json({ success: false, message: 'Maximum number of teams reached for this event' });
    }

    if (event.status !== 'Registration Open') {
      return res.status(400).json({
        success: false,
        message: 'Event registration is not open',
      });
    }

    // Check if user is already in a team for this event
    const existingTeamMember = await TeamMember.findOne({
      where: { userId: leaderId },
      include: [
        {
          model: Team,
          where: { eventId },
        },
      ],
    });

    if (existingTeamMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of a team for this event',
      });
    }

    // Check if team name is unique for this event
    const existingTeam = await Team.findOne({
      where: { teamName, eventId },
    });

    if (existingTeam) {
      return res.status(409).json({
        success: false,
        message: 'Team name already exists for this event',
      });
    }

    // Create team
    const team = await Team.create({
      teamName,
      eventId,
      description,
      projectName,
      projectDescription,
      githubRepository,
      projectVideo,
      projectDocumentation,
      tags,
    });

    // Add leader as team member
    await TeamMember.create({
      teamId: team.id,
      userId: leaderId,
      role: 'Leader',
    });

    // Audit + notify
    audit(leaderId, 'team_created', { eventId, teamId: team.id, metadata: { teamName } });
    emitToRoom(`event:${eventId}`, 'team_update', { teamId: team.id, type: 'created', data: { id: team.id, teamName } });

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: {
        team,
      },
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create team',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get all teams for an event
const getTeamsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { eventId };
    if (status) whereClause.status = status;

    // Get teams with pagination
    const { count, rows: teams } = await Team.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'name', 'status'],
        },
        {
          model: TeamMember,
          as: 'members',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'fullName', 'email', 'role'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,
      data: {
        teams,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Get teams by event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get teams',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get team by ID
const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;

    const team = await Team.findByPk(id, {
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'name', 'status', 'maxTeamSize'],
        },
        {
          model: TeamMember,
          as: 'members',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'fullName', 'email', 'role'],
            },
          ],
        },
      ],
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        team,
      },
    });
  } catch (error) {
    console.error('Get team by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get team',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Add member to team
const addTeamMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userId, role = 'Member' } = req.body;

    const team = await Team.findByPk(teamId, {
      include: [
        {
          model: Event,
          as: 'event',
        },
        {
          model: TeamMember,
          as: 'members',
        },
      ],
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    // Check if user is team leader
    const isLeader = team.members.some(
      member => member.userId === req.currentUser.id && member.role === 'Leader'
    );

    if (!isLeader) {
      return res.status(403).json({
        success: false,
        message: 'Only team leader can add members',
      });
    }

    // Check if event registration is still open
    if (team.event.status !== 'Registration Open') {
      return res.status(400).json({
        success: false,
        message: 'Event registration is closed',
      });
    }

    // Check team size limit
    if (team.members.length >= team.event.maxTeamSize) {
      return res.status(400).json({
        success: false,
        message: 'Team is at maximum capacity',
      });
    }

    // Check if user is already in a team for this event
    const existingTeamMember = await TeamMember.findOne({
      where: { userId },
      include: [
        {
          model: Team,
          where: { eventId: team.eventId },
        },
      ],
    });

    if (existingTeamMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of a team for this event',
      });
    }

    // Add member to team
    await TeamMember.create({
      teamId,
      userId,
      role,
    });

    audit(req.currentUser.id, 'team_member_added', { eventId: team.eventId, teamId: team.id, metadata: { userId, role } });
    emitToRoom(`team:${team.id}`, 'team_update', { teamId: team.id, type: 'member_joined', data: { userId, role } });

    res.status(200).json({
      success: true,
      message: 'Member added to team successfully',
    });
  } catch (error) {
    console.error('Add team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add team member',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Remove member from team
const removeTeamMember = async (req, res) => {
  try {
    const { teamId, userId } = req.params;

    const team = await Team.findByPk(teamId, {
      include: [
        {
          model: TeamMember,
          as: 'members',
        },
      ],
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    // Check if user is team leader
    const isLeader = team.members.some(
      member => member.userId === req.currentUser.id && member.role === 'Leader'
    );

    if (!isLeader) {
      return res.status(403).json({
        success: false,
        message: 'Only team leader can remove members',
      });
    }

    // Check if trying to remove leader
    const memberToRemove = team.members.find(member => member.userId === parseInt(userId));
    if (memberToRemove && memberToRemove.role === 'Leader') {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove team leader',
      });
    }

    // Remove member
    await TeamMember.destroy({
      where: { teamId, userId: parseInt(userId) },
    });

    audit(req.currentUser.id, 'team_member_removed', { eventId: team.eventId, teamId: team.id, metadata: { userId: parseInt(userId) } });
    emitToRoom(`team:${team.id}`, 'team_update', { teamId: team.id, type: 'member_left', data: { userId: parseInt(userId) } });

    res.status(200).json({
      success: true,
      message: 'Member removed from team successfully',
    });
  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove team member',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Update team
const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const team = await Team.findByPk(id, {
      include: [
        {
          model: TeamMember,
          as: 'members',
        },
      ],
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    // Check if user is team leader
    const isLeader = team.members.some(
      member => member.userId === req.currentUser.id && member.role === 'Leader'
    );

    if (!isLeader) {
      return res.status(403).json({
        success: false,
        message: 'Only team leader can update team',
      });
    }

    // Update team
    await team.update(updateData);

    audit(req.currentUser.id, 'team_updated', { eventId: team.eventId, teamId: team.id });
    emitToRoom(`team:${team.id}`, 'team_update', { teamId: team.id, type: 'updated', data: updateData });

    res.status(200).json({
      success: true,
      message: 'Team updated successfully',
      data: {
        team,
      },
    });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update team',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get user's teams
const getUserTeams = async (req, res) => {
  try {
    const userId = req.currentUser.id;

    const teams = await Team.findAll({
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'name', 'status'],
        },
        {
          model: TeamMember,
          as: 'members',
          where: { userId },
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'fullName', 'email'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: {
        teams,
      },
    });
  } catch (error) {
    console.error('Get user teams error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user teams',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  createTeam,
  getTeamsByEvent,
  getTeamById,
  addTeamMember,
  removeTeamMember,
  updateTeam,
  getUserTeams,
  inviteToTeam,
  joinByCode,
  leaveTeam,
};

// Invite to team (generate code)
async function inviteToTeam(req, res) {
  try {
    const { teamId } = req.params;
    const { email, role = 'Member' } = req.body;

    const team = await Team.findByPk(teamId, { include: [{ model: Event, as: 'event' }, { model: TeamMember, as: 'members' }] });
    if (!team) return res.status(404).json({ message: 'Team not found' });
    const isLeader = team.members.some(m => m.userId === req.currentUser.id && m.role === 'Leader');
    if (!isLeader) return res.status(403).json({ message: 'Only leader can invite' });

    const code = crypto.randomBytes(6).toString('hex').toUpperCase();
    const invitation = await TeamInvitation.create({
      invitationCode: code,
      teamId: team.id,
      eventId: team.eventId,
      createdBy: req.currentUser.id,
      role,
    });
    return res.status(201).json({ invitationCode: invitation.invitationCode });
  } catch (err) {
    console.error('Invite error:', err);
    return res.status(500).json({ message: 'Failed to create invitation' });
  }
}

// Join by code
async function joinByCode(req, res) {
  try {
    const { invitationCode } = req.body;
    const invite = await TeamInvitation.findOne({ invitationCode, isRevoked: false, expiresAt: { $gt: new Date() } });
    if (!invite) return res.status(404).json({ message: 'Invitation not found or expired' });

    // Check user already in any team for event
    const existingTeamMember = await TeamMember.findOne({
      where: { userId: req.currentUser.id },
      include: [{ model: Team, where: { eventId: invite.eventId } }],
    });
    if (existingTeamMember) return res.status(400).json({ message: 'Already in a team for this event' });

    await TeamMember.create({ teamId: invite.teamId, userId: req.currentUser.id, role: invite.role });
    return res.json({ message: 'Joined team' });
  } catch (err) {
    console.error('Join by code error:', err);
    return res.status(500).json({ message: 'Failed to join team' });
  }
}

// Leave team
async function leaveTeam(req, res) {
  try {
    const { teamId } = req.params;
    const team = await Team.findByPk(teamId, { include: [{ model: TeamMember, as: 'members' }] });
    if (!team) return res.status(404).json({ message: 'Team not found' });
    const membership = team.members.find(m => m.userId === req.currentUser.id);
    if (!membership) return res.status(404).json({ message: 'Not a team member' });
    if (membership.role === 'Leader') return res.status(400).json({ message: 'Leader cannot leave. Transfer leadership.' });
    await TeamMember.destroy({ where: { teamId: team.id, userId: req.currentUser.id } });
    return res.json({ message: 'Left team' });
  } catch (err) {
    console.error('Leave team error:', err);
    return res.status(500).json({ message: 'Failed to leave team' });
  }
}
