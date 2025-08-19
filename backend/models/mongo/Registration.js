const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
	userId: {
		type: Number,
		required: true,
		ref: 'User',
	},
	eventId: {
		type: Number,
		required: true,
		ref: 'Event',
	},
	status: {
		type: String,
		enum: ['pending', 'confirmed', 'waitlisted', 'cancelled'],
		default: 'confirmed',
	},
	teamId: {
		type: Number,
		default: null,
	},
	answers: {
		type: Object,
		default: {},
	},
	registeredAt: {
		type: Date,
		default: Date.now,
	},
}, {
	timestamps: true,
	toJSON: { virtuals: true },
	toObject: { virtuals: true },
});

registrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });
registrationSchema.index({ eventId: 1, status: 1 });

module.exports = mongoose.model('Registration', registrationSchema);


