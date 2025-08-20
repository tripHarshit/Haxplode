const { Event } = require('../models/sql');
const Announcement = require('../models/mongo/Announcement');
const { emitToRoom } = require('./socket');
const { scheduleCertificateGeneration } = require('./certificateScheduler');

// simple in-memory dedupe for reminders within TTL
const sentReminders = new Map(); // key -> expiresAt (ms)

function remember(key, ttlMs) {
  const now = Date.now();
  const existing = sentReminders.get(key);
  if (existing && existing > now) return true; // already sent
  sentReminders.set(key, now + ttlMs);
  return false;
}

function cleanup() {
  const now = Date.now();
  for (const [k, v] of sentReminders.entries()) {
    if (v <= now) sentReminders.delete(k);
  }
}

async function scanEventDeadlines() {
  const now = new Date();
  const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);
  const inOneDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // fetch recent events (optimistically get last 500 by createdAt)
  const events = await Event.findAll({ order: [['createdAt', 'DESC']], limit: 500 });
  for (const ev of events) {
    const tl = ev.timeline || {};
    const deadlines = [
      { name: 'registrationDeadline', ts: tl.registrationDeadline },
      { name: 'endDate', ts: tl.endDate },
      { name: 'startDate', ts: tl.startDate },
    ];
    for (const d of deadlines) {
      if (!d.ts) continue;
      const ts = new Date(d.ts);
      if (ts > now && ts <= inOneHour) {
        const key = `${ev.id}-${d.name}-1h`;
        if (!remember(key, 50 * 60 * 1000)) {
          emitToRoom(`event:${ev.id}`, 'event_announcement', {
            eventId: ev.id,
            type: 'deadline_reminder',
            message: `${d.name} in under 1 hour`,
            timestamp: new Date().toISOString(),
          });
        }
      } else if (ts > now && ts <= inOneDay) {
        const key = `${ev.id}-${d.name}-24h`;
        if (!remember(key, 23 * 60 * 60 * 1000)) {
          emitToRoom(`event:${ev.id}`, 'event_announcement', {
            eventId: ev.id,
            type: 'deadline_reminder',
            message: `${d.name} in under 24 hours`,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }
  }
}

async function publishScheduledAnnouncements() {
  const now = new Date();
  const toPublish = await Announcement.find({ status: 'Scheduled', scheduledFor: { $lte: now } }).limit(100);
  for (const ann of toPublish) {
    ann.status = 'Published';
    await ann.save();
    const visibilityFinal = ann.visibility || (Array.isArray(ann.targetAudience)
      ? (ann.targetAudience.includes('Participants') && ann.targetAudience.includes('Judges') ? 'Both' : (ann.targetAudience.includes('Judges') ? 'Judges' : 'Participants'))
      : 'Participants');
    const payload = {
      eventId: ann.eventId,
      type: 'announcement',
      message: ann.title,
      title: ann.title,
      body: ann.message,
      timestamp: new Date().toISOString(),
    };
    if (visibilityFinal === 'Participants' || visibilityFinal === 'Both') {
      try {
        const { Registration } = require('../models/mongo');
        const regs = await Registration.find({ eventId: ann.eventId, status: { $in: ['pending', 'confirmed'] } });
        const participantUserIds = Array.from(new Set(regs.map(r => r.userId).filter(Boolean)));
        for (const uid of participantUserIds) {
          emitToRoom(`user:${uid}`, 'notification', { userId: uid, type: 'announcement', title: ann.title, body: ann.message, link: `/events/${ann.eventId}`, timestamp: payload.timestamp });
        }
      } catch (err) {
        console.warn('Scheduler participant emit failed:', err?.message || err);
      }
    }
    if (visibilityFinal === 'Judges' || visibilityFinal === 'Both') {
      try {
        const { JudgeEventAssignment, Judge } = require('../models/sql');
        const assignments = await JudgeEventAssignment.findAll({
          where: { eventId: ann.eventId, isActive: true },
          include: [{ model: Judge, as: 'judge', attributes: ['userId'] }],
        });
        const judgeUserIds = assignments.map(a => a.judge?.userId).filter(Boolean);
        for (const uid of judgeUserIds) {
          emitToRoom(`user:${uid}`, 'notification', { userId: uid, type: 'announcement', title: ann.title, body: ann.message, link: `/events/${ann.eventId}`, timestamp: payload.timestamp });
        }
      } catch (err) {
        console.warn('Scheduler judge emit failed:', err?.message || err);
      }
    }
  }
}

function startSchedulers() {
  // run every minute
  setInterval(async () => {
    try {
      await scanEventDeadlines();
      await publishScheduledAnnouncements();
      cleanup();
    } catch (err) {
      console.warn('Scheduler error:', err.message);
    }
  }, 60 * 1000);

  // Start certificate generation scheduler
  scheduleCertificateGeneration();
}

module.exports = { startSchedulers };


