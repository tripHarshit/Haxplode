const Chat = require('../models/mongo/Chat');
const { Event, Team, TeamMember } = require('../models/sql');
const { emitToRoom } = require('../utils/socket');

// Create chat message
const createChatMessage = async (req, res) => {
  try {
    const {
      eventId,
      message,
      messageType,
      parentMessageId,
      tags,
    } = req.body;

    const senderId = req.currentUser.id;

    // Check if event exists
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if user is participating in the event (team member or organizer)
    let canParticipate = false;
    
    if (req.currentUser.role === 'Organizer' || event.createdBy === senderId) {
      canParticipate = true;
    } else {
      // Check if user is in a team for this event
      const teamMember = await TeamMember.findOne({
        where: { userId: senderId },
        include: [
          {
            model: Team,
            as: 'team',
            where: { eventId },
          },
        ],
      });
      canParticipate = !!teamMember;
    }

    if (!canParticipate) {
      return res.status(403).json({
        success: false,
        message: 'You are not participating in this event',
      });
    }

    // Create chat message
    const chatMessage = await Chat.create({
      eventId,
      senderId,
      message,
      messageType,
      parentMessageId,
      tags,
    });

    // Emit real-time Q&A message to the event room
    emitToRoom(`event:${eventId}`, 'qna_message', {
      eventId,
      message: chatMessage,
      timestamp: new Date().toISOString(),
    });

    // Also notify the event organizer directly
    if (event.createdBy) {
      emitToRoom(`user:${event.createdBy}`, 'notification', {
        type: 'qna',
        title: 'New Q&A message',
        body: message,
        eventId,
        messageId: chatMessage._id?.toString?.() || chatMessage.id,
        timestamp: new Date().toISOString(),
      });
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message: chatMessage,
      },
    });
  } catch (error) {
    console.error('Create chat message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get chat messages by event
const getChatMessagesByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 50, messageType, parentMessageId } = req.query;
    const offset = (page - 1) * limit;

    const filter = { eventId, isDeleted: false };
    if (messageType) filter.messageType = messageType;
    if (parentMessageId) filter.parentMessageId = parentMessageId;

    // Get messages with pagination
    const messages = await Chat.find(filter)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(parseInt(limit));

    const totalCount = await Chat.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: {
        messages,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: totalCount,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Get chat messages by event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat messages',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get questions for event
const getQuestionsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Get questions with pagination
    const questions = await Chat.findQuestionsByEvent(eventId)
      .skip(offset)
      .limit(parseInt(limit));

    const totalCount = await Chat.countDocuments({ eventId, isQuestion: true, isDeleted: false });
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: {
        questions,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: totalCount,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Get questions by event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get questions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get answers for a question
const getAnswersForQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    const answers = await Chat.findAnswersForQuestion(questionId);

    res.status(200).json({
      success: true,
      data: {
        answers,
      },
    });
  } catch (error) {
    console.error('Get answers for question error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get answers',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Update chat message
const updateChatMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, tags } = req.body;

    const chatMessage = await Chat.findById(id);
    if (!chatMessage) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Check if user is the sender
    if (chatMessage.senderId !== req.currentUser.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own messages',
      });
    }

    // Update message
    const updatedMessage = await Chat.findByIdAndUpdate(
      id,
      { 
        message, 
        tags, 
        isEdited: true, 
        editedAt: new Date(),
        lastModified: new Date(),
      },
      { new: true, runValidators: true }
    );

    // Emit update
    emitToRoom(`event:${chatMessage.eventId}`, 'qna_update', {
      eventId: chatMessage.eventId,
      message: updatedMessage,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: 'Message updated successfully',
      data: {
        message: updatedMessage,
      },
    });
  } catch (error) {
    console.error('Update chat message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Delete chat message
const deleteChatMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const chatMessage = await Chat.findById(id);
    if (!chatMessage) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Check if user is the sender or has organizer role
    if (chatMessage.senderId !== req.currentUser.id && req.currentUser.role !== 'Organizer') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages',
      });
    }

    // Soft delete message
    await Chat.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: req.currentUser.id,
    });

    // Emit delete
    emitToRoom(`event:${chatMessage.eventId}`, 'qna_delete', {
      eventId: chatMessage.eventId,
      messageId: id,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('Delete chat message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Add reaction to message
const addReaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { reactionType } = req.body;
    const userId = req.currentUser.id;

    const chatMessage = await Chat.findById(id);
    if (!chatMessage) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Add reaction
    await chatMessage.addReaction(userId, reactionType);

    // Emit reaction add
    emitToRoom(`event:${chatMessage.eventId}`, 'qna_reaction', {
      eventId: chatMessage.eventId,
      messageId: id,
      action: 'added',
      reactionType,
      userId,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: 'Reaction added successfully',
    });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reaction',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Remove reaction from message
const removeReaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.currentUser.id;

    const chatMessage = await Chat.findById(id);
    if (!chatMessage) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Remove reaction
    await chatMessage.removeReaction(userId);

    // Emit reaction remove
    emitToRoom(`event:${chatMessage.eventId}`, 'qna_reaction', {
      eventId: chatMessage.eventId,
      messageId: id,
      action: 'removed',
      userId,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: 'Reaction removed successfully',
    });
  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove reaction',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Mark message as read
const markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.currentUser.id;

    const chatMessage = await Chat.findById(id);
    if (!chatMessage) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Mark as read
    await chatMessage.markAsRead(userId);

    // Emit read receipt
    emitToRoom(`event:${chatMessage.eventId}`, 'qna_read', {
      eventId: chatMessage.eventId,
      messageId: id,
      userId,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: 'Message marked as read',
    });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Pin/unpin message (Organizer only)
const togglePinMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const chatMessage = await Chat.findById(id);
    if (!chatMessage) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Check if user has organizer role
    if (req.currentUser.role !== 'Organizer') {
      return res.status(403).json({
        success: false,
        message: 'Only organizers can pin/unpin messages',
      });
    }

    // Toggle pin
    await chatMessage.togglePin(req.currentUser.id);

    // Emit pin toggle
    emitToRoom(`event:${chatMessage.eventId}`, 'qna_pin', {
      eventId: chatMessage.eventId,
      messageId: id,
      isPinned: chatMessage.isPinned,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: `Message ${chatMessage.isPinned ? 'pinned' : 'unpinned'} successfully`,
    });
  } catch (error) {
    console.error('Toggle pin message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle pin message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  createChatMessage,
  getChatMessagesByEvent,
  getQuestionsByEvent,
  getAnswersForQuestion,
  updateChatMessage,
  deleteChatMessage,
  addReaction,
  removeReaction,
  markMessageAsRead,
  togglePinMessage,
};
