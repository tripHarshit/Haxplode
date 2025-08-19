const Announcement = require('../models/mongo/Announcement');
const Event = require('../models/sql/Event');
const { emitToRoom } = require('../utils/socket');
const { audit } = require('../utils/audit');

// Create announcement (Organizer only)
const createAnnouncement = async (req, res) => {
  try {
    const {
      eventId,
      title,
      message,
      type,
      priority,
      isPinned,
      isPublic,
      targetAudience,
      scheduledFor,
      expiresAt,
      tags,
    } = req.body;

    const organizerId = req.currentUser.id;

    // Check if event exists
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if user is event creator or organizer
    if (event.createdBy !== organizerId && req.currentUser.role !== 'Organizer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only event creator or organizers can create announcements.',
      });
    }

    // Create announcement
    const announcement = await Announcement.create({
      eventId,
      organizerId,
      title,
      message,
      type,
      priority,
      isPinned,
      isPublic,
      targetAudience,
      scheduledFor,
      expiresAt,
      tags,
      status: scheduledFor && scheduledFor > new Date() ? 'Scheduled' : 'Published',
    });

    audit(organizerId, 'announcement_created', { eventId, metadata: { title } });
    emitToRoom(`event:${eventId}`, 'event_announcement', { eventId, type: 'announcement', message: title, timestamp: new Date().toISOString() });

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: {
        announcement,
      },
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create announcement',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get announcements by event
const getAnnouncementsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 10, type, priority, isPinned } = req.query;
    const offset = (page - 1) * limit;

    const filter = { eventId };
    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    if (isPinned !== undefined) filter.isPinned = isPinned === 'true';

    // Get active announcements
    const announcements = await Announcement.findActiveByEvent(eventId)
      .skip(offset)
      .limit(parseInt(limit));

    const totalCount = await Announcement.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: {
        announcements,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: totalCount,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Get announcements by event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get announcements',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get announcement by ID
const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        announcement,
      },
    });
  } catch (error) {
    console.error('Get announcement by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get announcement',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Update announcement (Organizer only)
const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    // Check if user is event creator or organizer
    const event = await Event.findByPk(announcement.eventId);
    if (event.createdBy !== req.currentUser.id && req.currentUser.role !== 'Organizer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only event creator or organizers can update announcements.',
      });
    }

    // Update announcement
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      data: {
        announcement: updatedAnnouncement,
      },
    });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update announcement',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Delete announcement (Organizer only)
const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    // Check if user is event creator or organizer
    const event = await Event.findByPk(announcement.eventId);
    if (event.createdBy !== req.currentUser.id && req.currentUser.role !== 'Organizer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only event creator or organizers can delete announcements.',
      });
    }

    // Soft delete by changing status to Archived
    await Announcement.findByIdAndUpdate(id, { status: 'Archived' });

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete announcement',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Mark announcement as read
const markAnnouncementAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.currentUser.id;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    // Mark as read
    await announcement.markAsRead(userId);

    res.status(200).json({
      success: true,
      message: 'Announcement marked as read',
    });
  } catch (error) {
    console.error('Mark announcement as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark announcement as read',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get pinned announcements for event
const getPinnedAnnouncements = async (req, res) => {
  try {
    const { eventId } = req.params;

    const pinnedAnnouncements = await Announcement.findPinnedByEvent(eventId);

    res.status(200).json({
      success: true,
      data: {
        announcements: pinnedAnnouncements,
      },
    });
  } catch (error) {
    console.error('Get pinned announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pinned announcements',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncementsByEvent,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  markAnnouncementAsRead,
  getPinnedAnnouncements,
};
