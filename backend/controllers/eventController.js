const Event = require('../models/sql/Event');
const User = require('../models/sql/User');
const { Team, TeamMember } = require('../models/sql/Team');
const { Op } = require('sequelize');

// Create new event (Organizer only)
const createEvent = async (req, res) => {
  try {
    const {
      name,
      theme,
      description,
      rules,
      timeline,
      prizes,
      sponsors,
      maxTeamSize,
      maxTeams,
      registrationFee,
      isPublic,
      tags,
      location,
      isVirtual,
      virtualMeetingLink,
    } = req.body;

    const createdBy = req.currentUser.id;

    // Create event
    const event = await Event.create({
      name,
      theme,
      description,
      rules,
      timeline,
      prizes,
      sponsors,
      maxTeamSize,
      maxTeams,
      registrationFee,
      isPublic,
      tags,
      location,
      isVirtual,
      virtualMeetingLink,
      createdBy,
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: {
        event,
      },
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get all events (with optional filtering)
const getAllEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      isPublic,
      search,
      tags,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Apply filters
    if (status) whereClause.status = status;
    if (isPublic !== undefined) whereClause.isPublic = isPublic === 'true';
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { theme: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      whereClause.tags = { [Op.overlap]: tagArray };
    }

    // Get events with pagination
    const { count, rows: events } = await Event.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'fullName', 'email'],
        },
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,
      data: {
        events,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Get all events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get events',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get single event by ID
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'fullName', 'email'],
        },
        {
          model: Team,
          as: 'teams',
          attributes: ['id', 'teamName', 'status', 'isRegistered'],
        },
      ],
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if user can view private events
    if (!event.isPublic && req.currentUser?.role !== 'Organizer' && req.currentUser?.id !== event.createdBy) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This event is private.',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        event,
      },
    });
  } catch (error) {
    console.error('Get event by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get event',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Update event (Organizer only)
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if user is the creator or has organizer role
    if (event.createdBy !== req.currentUser.id && req.currentUser.role !== 'Organizer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only event creator or organizers can update events.',
      });
    }

    // Update event
    await event.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: {
        event,
      },
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Delete event (Organizer only)
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if user is the creator or has organizer role
    if (event.createdBy !== req.currentUser.id && req.currentUser.role !== 'Organizer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only event creator or organizers can delete events.',
      });
    }

    // Check if event has teams or submissions
    const teamCount = await Team.count({ where: { eventId: id } });
    if (teamCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete event with existing teams. Please remove teams first.',
      });
    }

    // Delete event
    await event.destroy();

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get events by user (created by or participating in)
const getEventsByUser = async (req, res) => {
  try {
    const userId = req.currentUser.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Get events created by user
    const createdEvents = await Event.findAndCountAll({
      where: { createdBy: userId },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Get events where user is a team member
    const participatingEvents = await Event.findAll({
      include: [
        {
          model: Team,
          as: 'teams',
          include: [
            {
              model: TeamMember,
              as: 'members',
              where: { userId },
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: {
        createdEvents: {
          events: createdEvents.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(createdEvents.count / limit),
            totalItems: createdEvents.count,
            itemsPerPage: parseInt(limit),
          },
        },
        participatingEvents,
      },
    });
  } catch (error) {
    console.error('Get events by user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user events',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Change event status (Organizer only)
const changeEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if user is the creator or has organizer role
    if (event.createdBy !== req.currentUser.id && req.currentUser.role !== 'Organizer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only event creator or organizers can change event status.',
      });
    }

    // Validate status transition
    const validTransitions = {
      'Draft': ['Published', 'Cancelled'],
      'Published': ['Registration Open', 'Cancelled'],
      'Registration Open': ['Registration Closed', 'In Progress', 'Cancelled'],
      'Registration Closed': ['In Progress', 'Cancelled'],
      'In Progress': ['Completed', 'Cancelled'],
      'Completed': [],
      'Cancelled': [],
    };

    if (!validTransitions[event.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${event.status} to ${status}`,
      });
    }

    // Update event status
    await event.update({ status });

    res.status(200).json({
      success: true,
      message: 'Event status updated successfully',
      data: {
        event,
      },
    });
  } catch (error) {
    console.error('Change event status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change event status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventsByUser,
  changeEventStatus,
};
