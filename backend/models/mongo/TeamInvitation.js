const mongoose = require('mongoose');

const teamInvitationSchema = new mongoose.Schema({
	invitationCode: {
		type: String,
		required: true,
		unique: true,
		index: true,
	},
	teamId: {
		type: Number,
		required: true,
		ref: 'Team',
		index: true,
	},
	eventId: {
		type: Number,
		required: true,
		ref: 'Event',
		index: true,
	},
	createdBy: {
		type: Number,
		required: true,
		ref: 'User',
	},
	role: {
		type: String,
		enum: ['Leader', 'Member'],
		default: 'Member',
	},
	expiresAt: {
		type: Date,
		default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
	},
	isRevoked: {
		type: Boolean,
		default: false,
	},
}, {
	timestamps: true,
});

teamInvitationSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('TeamInvitation', teamInvitationSchema);


