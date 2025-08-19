const { emitToRoom } = require('../utils/socket');
const { audit } = require('../utils/audit');

// POST /api/notifications
async function sendNotification(req, res) {
  try {
    const { scope = 'user', targetId, type = 'notification', title, body, link } = req.body;
    if (!targetId) return res.status(400).json({ message: 'targetId is required' });
    const payload = { type, title, body, link, timestamp: new Date().toISOString() };

    let room;
    switch (scope) {
      case 'event':
        room = `event:${targetId}`;
        emitToRoom(room, 'event_announcement', { eventId: Number(targetId), type, message: title || body, timestamp: payload.timestamp });
        break;
      case 'team':
        room = `team:${targetId}`;
        emitToRoom(room, 'team_update', { teamId: Number(targetId), type: 'notification', data: payload });
        break;
      case 'submission':
        room = `submission:${targetId}`;
        emitToRoom(room, 'submission_update', { submissionId: String(targetId), type: 'notification', data: payload });
        break;
      default:
        room = `user:${targetId}`;
        emitToRoom(room, 'notification', { userId: Number(targetId), ...payload });
    }

    audit(req.currentUser.id, 'notification_sent', { metadata: { scope, targetId, type } });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Send notification error:', err);
    return res.status(500).json({ message: 'Failed to send notification' });
  }
}

module.exports = { sendNotification };


