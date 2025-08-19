const bcrypt = require('bcryptjs');
const https = require('https');
const crypto = require('crypto');
const User = require('../models/sql/User');
const { generateTokens, generatePasswordResetToken, verifyPasswordResetToken } = require('../utils/jwtUtils');
const jwt = require('jsonwebtoken');

// User signup
const signup = async (req, res) => {
  try {
    const { name, email, role, dateOfBirth, password, socialLogin } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Convert dateOfBirth string to Date
    const dob = new Date(dateOfBirth);

    console.log('Signup - Creating user with data:', {
      fullName: name,
      email,
      role: role.charAt(0).toUpperCase() + role.slice(1),
      dob,
      passwordProvided: password ? 'YES' : 'NO',
      passwordLength: password ? password.length : 0
    });

    // Create user
    const user = await User.create({
      fullName: name, // Map name to fullName for database
      email,
      role: role.charAt(0).toUpperCase() + role.slice(1), // Capitalize first letter
      dob,
      password,
      emailVerified: !socialLogin, // Auto-verify if social login
    });

    // Generate tokens
    const tokens = generateTokens(user.id, user.role);

    // Update last login
    await user.update({ lastLoginAt: new Date() });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
        },
        tokens,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// User login
const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
    
    // Debug: Check what's actually stored in the database
    console.log('=== DATABASE DEBUG INFO ===');
    console.log('User found in database:');
    console.log('- ID:', user.id);
    console.log('- Email:', user.email);
    console.log('- Role:', user.role);
    console.log('- Password length:', user.password ? user.password.length : 'NULL');
    console.log('- Password starts with:', user.password ? user.password.substring(0, 10) + '...' : 'NULL');
    console.log('- Is password hashed?', user.password && user.password.startsWith('$2a$') ? 'YES (bcrypt)' : 'NO (plain text)');
    console.log('=== END DEBUG INFO ===');

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.',
      });
    }

    // Verify password
    console.log('Login attempt - Email:', email);
    console.log('Login attempt - Password provided:', password ? 'YES' : 'NO');
    console.log('Login attempt - User found:', user ? 'YES' : 'NO');
    console.log('Login attempt - User ID:', user?.id);
    console.log('Login attempt - User role:', user?.role);
    console.log('Login attempt - Stored password:', user?.password);
    console.log('Login attempt - Provided password:', password);
    
    const isPasswordValid = await user.comparePassword(password);
    console.log('Login attempt - Password validation result:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Login failed - Password invalid for user:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate tokens
    const tokens = generateTokens(user.id, user.role);

    // Update last login
    await user.update({ lastLoginAt: new Date() });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
          lastLoginAt: user.lastLoginAt,
        },
        tokens: rememberMe ? tokens : { accessToken: tokens.accessToken },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    // Check if user exists and is active
    const user = await User.findByPk(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive',
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user.id, user.role);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        tokens,
      },
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired. Please login again.',
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh token',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.currentUser.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { fullName, bio, githubUsername, linkedinProfile } = req.body;
    const userId = req.currentUser.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update user
    await user.update({
      fullName: fullName || user.fullName,
      bio: bio || user.bio,
      githubUsername: githubUsername || user.githubUsername,
      linkedinProfile: linkedinProfile || user.linkedinProfile,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          bio: user.bio,
          githubUsername: user.githubUsername,
          linkedinProfile: user.linkedinProfile,
        },
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.currentUser.id;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match',
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password
    await user.update({ password: newPassword });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Logout (client-side token removal)
const logout = async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // You could implement a blacklist for tokens if needed
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to logout',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  signup,
  login,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  forgotPassword,
  resetPassword,
  loginWithGoogle,
};

// Forgot password (issues a reset token; integrate email provider separately)
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(200).json({ success: true, message: 'If the email exists, a reset link has been sent.' });
    }
    const token = generatePasswordResetToken(user.id);
    // TODO: send via email provider; for now return token for testing
    return res.status(200).json({ success: true, message: 'Password reset link generated', token });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Failed to process forgot password' });
  }
}

// Google OAuth login
async function loginWithGoogle(req, res) {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'idToken is required' });
    }
    const clientId = process.env.OAUTH_GOOGLE_CLIENT_ID;
    // Verify with Google tokeninfo endpoint
    const tokenInfo = await new Promise((resolve, reject) => {
      https.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`, (resp) => {
        let data = '';
        resp.on('data', (chunk) => { data += chunk; });
        resp.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json.error_description || json.error) return reject(new Error(json.error_description || json.error));
            resolve(json);
          } catch (e) { reject(e); }
        });
      }).on('error', reject);
    });

    if (clientId && tokenInfo.aud !== clientId) {
      return res.status(401).json({ success: false, message: 'Invalid Google client' });
    }

    const email = tokenInfo.email;
    const fullName = tokenInfo.name || tokenInfo.given_name || 'Google User';
    if (!email) return res.status(400).json({ success: false, message: 'Email not present in token' });

    let user = await User.findOne({ where: { email } });
    if (!user) {
      // Create user with defaults
      user = await User.create({
        fullName,
        email,
        role: 'Participant',
        dob: new Date(2000, 0, 1),
        password: crypto.randomBytes(32).toString('hex'),
        emailVerified: true,
      });
    }

    const tokens = generateTokens(user.id, user.role);
    await user.update({ lastLoginAt: new Date() });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
        tokens,
      },
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ success: false, message: 'Failed to login with Google' });
  }
}

// Reset password
async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;
    const decoded = verifyPasswordResetToken(token);
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    await user.update({ password: newPassword });
    return res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to reset password' });
  }
}
