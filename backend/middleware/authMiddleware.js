const jwt = require('jsonwebtoken');
const { User } = require('../models/sql');

const authMiddleware = async (req, res, next) => {
  try {
    // Allow CORS preflight requests to pass through without auth
    if (req.method === 'OPTIONS') {
      return next();
    }

    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if this is an access token, not a refresh token
      if (decoded.type !== 'access') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token type. Please use access token.',
        });
      }
      
      req.user = decoded;
      
      // Fetch fresh user data from database
      const user = await User.findByPk(decoded.userId);
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User not found or inactive.',
        });
      }
      
      // If user is a judge, include judge profile
      if (user.role === 'Judge') {
        const { Judge } = require('../models/sql/Judge');
        const judgeProfile = await Judge.findOne({ where: { userId: user.id } });
        if (judgeProfile) {
          user.judgeProfile = judgeProfile;
        }
      }
      
      req.currentUser = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired. Please login again.',
        });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token. Please login again.',
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
    });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    // Allow CORS preflight requests without auth/role checks
    if (req.method === 'OPTIONS') {
      return next();
    }
    if (!req.currentUser) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated.',
      });
    }

    if (!roles.includes(req.currentUser.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${req.currentUser.role} role is not authorized to access this resource.`,
      });
    }

    next();
  };
};

// Specific role middleware functions
const authorizeParticipant = authorize('Participant');
const authorizeOrganizer = authorize('Organizer');
const authorizeJudge = authorize('Judge');
const authorizeOrganizerOrJudge = authorize('Organizer', 'Judge');

// Optional authentication middleware (for public routes that can show different content for authenticated users)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.userId);
        
        if (user && user.isActive) {
          req.user = decoded;
          req.currentUser = user;
        }
      } catch (error) {
        // Token is invalid, but we don't block the request
        console.log('Optional auth failed:', error.message);
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // Continue without authentication
  }
};

module.exports = {
  authMiddleware,
  authorize,
  authorizeParticipant,
  authorizeOrganizer,
  authorizeJudge,
  authorizeOrganizerOrJudge,
  optionalAuth,
};
