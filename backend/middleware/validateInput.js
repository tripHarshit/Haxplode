const Joi = require('joi');

const validateInput = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorDetails,
      });
    }

    // Replace req.body with validated data
    req.body = value;
    next();
  };
};

// Validation schemas
const authSchemas = {
  signup: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Full name must be at least 2 characters long',
        'string.max': 'Full name cannot exceed 100 characters',
        'any.required': 'Full name is required',
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
    role: Joi.string()
      .valid('participant', 'organizer', 'judge')
      .required()
      .messages({
        'any.only': 'Role must be one of: participant, organizer, judge',
        'any.required': 'Role is required',
      }),
    dateOfBirth: Joi.string()
      .isoDate()
      .required()
      .messages({
        'string.isoDate': 'Please provide a valid date of birth',
        'any.required': 'Date of birth is required',
      }),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.required': 'Password is required',
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Please confirm your password',
      }),
    termsAccepted: Joi.boolean()
      .valid(true)
      .required()
      .messages({
        'any.only': 'You must accept the terms and conditions',
        'any.required': 'Terms acceptance is required',
      }),
    socialLogin: Joi.object({
      provider: Joi.string().valid('google', 'github'),
      token: Joi.string(),
    }).optional(),
  }),

  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required',
      }),
    rememberMe: Joi.boolean().default(false),
  }),
};

const eventSchemas = {
  create: Joi.object({
    name: Joi.string()
      .min(3)
      .max(200)
      .required()
      .messages({
        'string.min': 'Event name must be at least 3 characters long',
        'string.max': 'Event name cannot exceed 200 characters',
        'any.required': 'Event name is required',
      }),
    theme: Joi.string()
      .min(10)
      .max(500)
      .required()
      .messages({
        'string.min': 'Theme must be at least 10 characters long',
        'string.max': 'Theme cannot exceed 500 characters',
        'any.required': 'Theme is required',
      }),
    description: Joi.string()
      .min(20)
      .max(2000)
      .required()
      .messages({
        'string.min': 'Description must be at least 20 characters long',
        'string.max': 'Description cannot exceed 2000 characters',
        'any.required': 'Description is required',
      }),
    rules: Joi.string()
      .min(20)
      .max(5000)
      .required()
      .messages({
        'string.min': 'Rules must be at least 20 characters long',
        'string.max': 'Rules cannot exceed 5000 characters',
        'any.required': 'Rules are required',
      }),
    timeline: Joi.object({
      startDate: Joi.date().greater('now').required(),
      endDate: Joi.date().greater(Joi.ref('startDate')).required(),
      registrationDeadline: Joi.date().less(Joi.ref('startDate')).required(),
    }).required(),
    prizes: Joi.array()
      .items(Joi.object({
        position: Joi.string().required(),
        amount: Joi.number().positive().required(),
        description: Joi.string().optional(),
      }))
      .min(1)
      .required(),
    sponsors: Joi.array().items(Joi.string()).default([]),
    maxTeamSize: Joi.number().integer().min(1).max(10).default(4),
    maxTeams: Joi.number().integer().min(1).default(50),
    registrationFee: Joi.number().positive().default(0),
    isPublic: Joi.boolean().default(false),
    tags: Joi.array().items(Joi.string()).default([]),
    location: Joi.string().max(200).optional(),
    isVirtual: Joi.boolean().default(false),
    virtualMeetingLink: Joi.string().uri().optional(),
  }),

  update: Joi.object({
    name: Joi.string().min(3).max(200).optional(),
    theme: Joi.string().min(10).max(500).optional(),
    description: Joi.string().min(20).max(2000).optional(),
    rules: Joi.string().min(20).max(5000).optional(),
    timeline: Joi.object({
      startDate: Joi.date().optional(),
      endDate: Joi.date().optional(),
      registrationDeadline: Joi.date().optional(),
    }).optional(),
    prizes: Joi.array().items(Joi.object({
      position: Joi.string().required(),
      amount: Joi.number().positive().required(),
      description: Joi.string().optional(),
    })).optional(),
    sponsors: Joi.array().items(Joi.string()).optional(),
    maxTeamSize: Joi.number().integer().min(1).max(10).optional(),
    maxTeams: Joi.number().integer().min(1).optional(),
    registrationFee: Joi.number().positive().optional(),
    isPublic: Joi.boolean().optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    location: Joi.string().max(200).optional(),
    isVirtual: Joi.boolean().optional(),
    virtualMeetingLink: Joi.string().uri().optional(),
  }),
};

const teamSchemas = {
  create: Joi.object({
    teamName: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Team name must be at least 2 characters long',
        'string.max': 'Team name cannot exceed 100 characters',
        'any.required': 'Team name is required',
      }),
    eventId: Joi.number().integer().positive().required(),
    description: Joi.string().max(1000).optional(),
    projectName: Joi.string().max(200).optional(),
    projectDescription: Joi.string().max(2000).optional(),
    githubRepository: Joi.string().uri().optional(),
    projectVideo: Joi.string().uri().optional(),
    projectDocumentation: Joi.string().uri().optional(),
    tags: Joi.array().items(Joi.string()).default([]),
  }),
};

const submissionSchemas = {
  create: Joi.object({
    teamId: Joi.number().integer().positive().required(),
    eventId: Joi.number().integer().positive().required(),
    githubLink: Joi.string()
      .pattern(/^https:\/\/github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-._]+$/)
      .required()
      .messages({
        'string.pattern.base': 'Please provide a valid GitHub repository URL',
        'any.required': 'GitHub repository link is required',
      }),
    docLink: Joi.string().uri().required(),
    videoLink: Joi.string().uri().required(),
    projectName: Joi.string().min(1).max(200).required(),
    projectDescription: Joi.string().min(10).max(2000).required(),
    technologies: Joi.array().items(Joi.string()).max(20).default([]),
    features: Joi.array().items(Joi.string()).max(50).default([]),
    challenges: Joi.string().max(1000).optional(),
    learnings: Joi.string().max(1000).optional(),
    futurePlans: Joi.string().max(1000).optional(),
  }),
};

const announcementSchemas = {
  create: Joi.object({
    eventId: Joi.number().integer().positive().required(),
    title: Joi.string().min(1).max(200).required(),
    message: Joi.string().min(1).max(2000).required(),
    type: Joi.string().valid('General', 'Important', 'Urgent', 'Update', 'Reminder').default('General'),
    priority: Joi.string().valid('Low', 'Medium', 'High', 'Critical').default('Medium'),
    isPinned: Joi.boolean().default(false),
    isPublic: Joi.boolean().default(true),
    targetAudience: Joi.array().items(Joi.string().valid('All', 'Participants', 'Organizers', 'Judges', 'Teams')).default(['All']),
    scheduledFor: Joi.date().optional(),
    expiresAt: Joi.date().optional(),
    tags: Joi.array().items(Joi.string()).max(10).default([]),
  }),
};

const chatSchemas = {
  create: Joi.object({
    eventId: Joi.number().integer().positive().required(),
    message: Joi.string().min(1).max(1000).required(),
    messageType: Joi.string().valid('Text', 'Question', 'Answer', 'Announcement', 'File').default('Text'),
    parentMessageId: Joi.string().optional(),
    tags: Joi.array().items(Joi.string()).max(5).default([]),
  }),
};

module.exports = {
  validateInput,
  authSchemas,
  eventSchemas,
  teamSchemas,
  submissionSchemas,
  announcementSchemas,
  chatSchemas,
};
