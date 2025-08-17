const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      message: `Validation Error: ${message}`,
      statusCode: 400,
      type: 'ValidationError',
    };
  }

  // Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = Object.keys(err.fields)[0];
    error = {
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
      statusCode: 409,
      type: 'DuplicateError',
    };
  }

  // Sequelize foreign key constraint errors
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    error = {
      message: 'Referenced record does not exist',
      statusCode: 400,
      type: 'ForeignKeyError',
    };
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      message: `Validation Error: ${message}`,
      statusCode: 400,
      type: 'ValidationError',
    };
  }

  // Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = {
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
      statusCode: 409,
      type: 'DuplicateError',
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token',
      statusCode: 401,
      type: 'TokenError',
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token expired',
      statusCode: 401,
      type: 'TokenError',
    };
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      message: 'File too large',
      statusCode: 400,
      type: 'FileError',
    };
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    error = {
      message: 'Too many files',
      statusCode: 400,
      type: 'FileError',
    };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = {
      message: 'Unexpected file field',
      statusCode: 400,
      type: 'FileError',
    };
  }

  // Rate limiting errors
  if (err.status === 429) {
    error = {
      message: 'Too many requests, please try again later',
      statusCode: 429,
      type: 'RateLimitError',
    };
  }

  // Cast errors (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    error = {
      message: 'Invalid ID format',
      statusCode: 400,
      type: 'CastError',
    };
  }

  // Default error
  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Don't send error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(isDevelopment && {
      stack: err.stack,
      error: err,
    }),
    ...(error.type && { type: error.type }),
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method,
  });
};

module.exports = errorHandler;
