const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema({
	_ts: { type: Date, default: Date.now },
	ts: { type: Date, default: Date.now },
	userId: { type: Number, required: true, index: true },
	type: { type: String, required: true, index: true },
	context: { type: Object, default: {} },
	metadata: { type: Object, default: {} },
	durationMs: { type: Number },
	eventId: { type: Number, index: true },
	teamId: { type: Number, index: true },
	submissionId: { type: String, index: true },
}, {
	timestamps: true,
});

analyticsEventSchema.index({ ts: -1 });

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);


