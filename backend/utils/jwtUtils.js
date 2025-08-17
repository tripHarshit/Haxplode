const jwt = require('jsonwebtoken');

// Generate access token
const generateAccessToken = (userId, role) => {
  try {
    return jwt.sign(
      { 
        userId, 
        role,
        type: 'access'
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
      }
    );
  } catch (error) {
    throw new Error('Failed to generate access token');
  }
};

// Generate refresh token
const generateRefreshToken = (userId, role) => {
  try {
    return jwt.sign(
      { 
        userId, 
        role,
        type: 'refresh'
      },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { 
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' 
      }
    );
  } catch (error) {
    throw new Error('Failed to generate refresh token');
  }
};

// Generate both tokens
const generateTokens = (userId, role) => {
  try {
    const accessToken = generateAccessToken(userId, role);
    const refreshToken = generateRefreshToken(userId, role);
    
    return {
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    };
  } catch (error) {
    throw new Error('Failed to generate tokens');
  }
};

// Verify access token
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Access token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid access token');
    } else {
      throw error;
    }
  }
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    } else {
      throw error;
    }
  }
};

// Decode token without verification (for logging/debugging)
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    throw new Error('Failed to decode token');
  }
};

// Check if token is expired
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Get token expiration time
const getTokenExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return null;
    }
    
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};

// Generate password reset token
const generatePasswordResetToken = (userId) => {
  try {
    return jwt.sign(
      { 
        userId, 
        type: 'password-reset',
        purpose: 'reset-password'
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: '1h' // Short expiration for security
      }
    );
  } catch (error) {
    throw new Error('Failed to generate password reset token');
  }
};

// Verify password reset token
const verifyPasswordResetToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'password-reset' || decoded.purpose !== 'reset-password') {
      throw new Error('Invalid token type or purpose');
    }
    
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Password reset token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid password reset token');
    } else {
      throw error;
    }
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  isTokenExpired,
  getTokenExpiration,
  generatePasswordResetToken,
  verifyPasswordResetToken,
};
