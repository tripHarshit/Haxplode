const { AnalyticsEvent } = require('../models/mongo');

async function audit(userId, type, { eventId, teamId, submissionId, context = {}, metadata = {}, durationMs } = {}) {
  try {
    await AnalyticsEvent.create({ userId, type, eventId, teamId, submissionId, context, metadata, durationMs, ts: new Date() });
  } catch (err) {
    // Do not crash on audit failure
    console.warn('Audit log failed:', err.message);
  }
}

module.exports = { audit };


