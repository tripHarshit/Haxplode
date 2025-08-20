const jwt = require('jsonwebtoken');
const { User } = require('../models/sql');

const authMiddleware = async (req, res, next) => {
  try {
    console.log('🔍 [authMiddleware] Starting authentication for:', req.method, req.path);
    
    // Allow CORS preflight requests to pass through without auth
    if (req.method === 'OPTIONS') {
      console.log('🔍 [authMiddleware] CORS preflight request, allowing through');
      return next();
    }

    const authHeader = req.headers.authorization;
    console.log('🔍 [authMiddleware] Auth header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [authMiddleware] No valid auth header found');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('🔍 [authMiddleware] Token extracted, length:', token.length);
    
    if (!token) {
      console.log('❌ [authMiddleware] No token found after extraction');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    try {
      console.log('🔍 [authMiddleware] Verifying JWT token...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('🔍 [authMiddleware] Token verified, user ID:', decoded.userId);
      
      // Check if this is an access token, not a refresh token
      if (decoded.type !== 'access') {
        console.log('❌ [authMiddleware] Invalid token type:', decoded.type);
        return res.status(401).json({
          success: false,
          message: 'Invalid token type. Please use access token.',
        });
      }
      
      req.user = decoded;
      
      // Fetch fresh user data from database
      console.log('🔍 [authMiddleware] Fetching user from database...');
      const user = await User.findByPk(decoded.userId);
      if (!user || !user.isActive) {
        console.log('❌ [authMiddleware] User not found or inactive:', !!user, user?.isActive);
        return res.status(401).json({
          success: false,
          message: 'User not found or inactive.',
        });
      }
      
      console.log('🔍 [authMiddleware] User found, role:', user.role);
      
      // If user is a judge, include judge profile
      if (user.role === 'Judge') {
        console.log('🔍 [authMiddleware] User is judge, fetching judge profile...');
        const { Judge } = require('../models/sql/Judge');
        const judgeProfile = await Judge.findOne({ where: { userId: user.id } });
        if (judgeProfile) {
          user.judgeProfile = judgeProfile;
          console.log('🔍 [authMiddleware] Judge profile found, ID:', judgeProfile.id);
        } else {
          console.log('⚠️ [authMiddleware] User is judge but no judge profile found');
        }
      }
      
      req.currentUser = user;
      console.log('🔍 [authMiddleware] Authentication successful for user:', user.id, user.role);
      next();
    } catch (error) {
      console.error('❌ [authMiddleware] JWT verification error:', error.name, error.message);
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
    console.error('❌ [authMiddleware] General error:', error);
    console.error('❌ [authMiddleware] Error stack:', error.stack);
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
const authorizeJudge = (req, res, next) => {
  console.log('🔍 [authorizeJudge] Checking judge authorization');
  console.log('🔍 [authorizeJudge] Current user:', req.currentUser?.id, req.currentUser?.role);
  
  // Allow CORS preflight requests without auth/role checks
  if (req.method === 'OPTIONS') {
    console.log('🔍 [authorizeJudge] CORS preflight request, allowing through');
    return next();
  }
  
  if (!req.currentUser) {
    console.log('❌ [authorizeJudge] No current user found');
    return res.status(401).json({
      success: false,
      message: 'User not authenticated.',
    });
  }

  if (req.currentUser.role !== 'Judge') {
    console.log('❌ [authorizeJudge] User is not a judge, role:', req.currentUser.role);
    return res.status(403).json({
      success: false,
      message: 'Access denied. Judge role required.',
    });
  }

  console.log('✅ [authorizeJudge] Judge authorization successful');
  next();
};
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
