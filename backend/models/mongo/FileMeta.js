const mongoose = require('mongoose');

const fileMetaSchema = new mongoose.Schema({
	ownerId: { type: Number, required: true, index: true },
	scope: { type: String, enum: ['user', 'event', 'team', 'submission', 'announcement', 'general'], required: true },
	path: { type: String, required: true },
	sizeBytes: { type: Number, required: true },
	mimeType: { type: String, required: true },
	eventId: { type: Number },
	teamId: { type: Number },
	submissionId: { type: String },
	tags: { type: [String], default: [] },
	checksum: { type: String },
}, { timestamps: true });

fileMetaSchema.index({ scope: 1, eventId: 1 });

module.exports = mongoose.model('FileMeta', fileMetaSchema);


