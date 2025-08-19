// Import all MongoDB models
const Submission = require('./Submission');
const Announcement = require('./Announcement');
const Chat = require('./Chat');
const Registration = require('./Registration');
const TeamInvitation = require('./TeamInvitation');
const AnalyticsEvent = require('./AnalyticsEvent');
const FileMeta = require('./FileMeta');

module.exports = {
  Submission,
  Announcement,
  Chat,
  Registration,
  TeamInvitation,
  AnalyticsEvent,
  FileMeta,
};
