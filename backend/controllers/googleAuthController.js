const { OAuth2Client } = require('google-auth-library');
const { User } = require('../models/sql');
const { generateTokens } = require('../utils/jwtUtils');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Verify Google ID token
const verifyGoogleToken = async (idToken) => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    return {
      googleId: payload.sub,
      email: payload.email,
      fullName: payload.name,
      picture: payload.picture,
      emailVerified: payload.email_verified,
    };
  } catch (error) {
    console.error('Google token verification failed:', error);
    throw new Error('Invalid Google token');
  }
};

// Google OAuth login/signup
const googleAuth = async (req, res) => {
  try {
    const { idToken, role = 'Participant' } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Google ID token is required',
      });
    }

    // Verify Google token
    const googleUser = await verifyGoogleToken(idToken);
    
    if (!googleUser.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Google email must be verified',
      });
    }

    // Check if user already exists
    let user = await User.findOne({ where: { email: googleUser.email } });
    
    if (user) {
      // User exists, update social login info and last login
      await user.update({
        socialLogin: {
          google: {
            id: googleUser.googleId,
            picture: googleUser.picture,
            lastLogin: new Date(),
          },
        },
        lastLoginAt: new Date(),
      });
    } else {
      // Create new user
      const dob = new Date();
      dob.setFullYear(dob.getFullYear() - 18); // Default to 18 years old
      
      user = await User.create({
        fullName: googleUser.fullName,
        email: googleUser.email,
        role,
        dob,
        password: `google_${googleUser.googleId}_${Date.now()}`, // Generate a secure random password
        emailVerified: true,
        profilePicture: googleUser.picture,
        socialLogin: {
          google: {
            id: googleUser.googleId,
            picture: googleUser.picture,
            firstLogin: new Date(),
            lastLogin: new Date(),
          },
        },
        lastLoginAt: new Date(),
      });
    }

    // Generate tokens
    const tokens = generateTokens(user.id, user.role);

    res.status(200).json({
      success: true,
      message: user.socialLogin?.google?.firstLogin ? 'User registered successfully' : 'Login successful',
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
          profilePicture: user.profilePicture,
          socialLogin: user.socialLogin,
        },
        tokens,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Google authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get Google OAuth URL for frontend redirect
const getGoogleAuthUrl = (req, res) => {
  try {
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.FRONTEND_URL}/auth/google/callback`;
    const scope = 'openid email profile';
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `prompt=consent`;

    res.status(200).json({
      success: true,
      data: {
        authUrl,
        redirectUri,
      },
    });
  } catch (error) {
    console.error('Get Google auth URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate Google auth URL',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Handle Google OAuth callback (for server-side flow)
const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required',
      });
    }

    // Exchange code for tokens
    const { tokens } = await googleClient.getToken({
      code,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI || `${process.env.FRONTEND_URL}/auth/google/callback`,
    });

    // Get user info from Google
    googleClient.setCredentials(tokens);
    const oauth2 = googleClient.oauth2('v2');
    const { data } = await oauth2.userinfo.get();

    // Process user data similar to googleAuth
    const googleUser = {
      googleId: data.id,
      email: data.email,
      fullName: data.name,
      picture: data.picture,
      emailVerified: data.verified_email,
    };

    if (!googleUser.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Google email must be verified',
      });
    }

    // Check if user exists or create new one
    let user = await User.findOne({ where: { email: googleUser.email } });
    
    if (user) {
      await user.update({
        socialLogin: {
          google: {
            id: googleUser.googleId,
            picture: googleUser.picture,
            lastLogin: new Date(),
          },
        },
        lastLoginAt: new Date(),
      });
    } else {
      const dob = new Date();
      dob.setFullYear(dob.getFullYear() - 18);
      
      user = await User.create({
        fullName: googleUser.fullName,
        email: googleUser.email,
        role: 'Participant',
        dob,
        password: `google_${googleUser.googleId}_${Date.now()}`,
        emailVerified: true,
        profilePicture: googleUser.picture,
        socialLogin: {
          google: {
            id: googleUser.googleId,
            picture: googleUser.picture,
            firstLogin: new Date(),
            lastLogin: new Date(),
          },
        },
        lastLoginAt: new Date(),
      });
    }

    // Generate tokens
    const jwtTokens = generateTokens(user.id, user.role);

    // Redirect to frontend with tokens
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/auth/google/success?` +
      `accessToken=${encodeURIComponent(jwtTokens.accessToken)}&` +
      `refreshToken=${encodeURIComponent(jwtTokens.refreshToken)}&` +
      `userId=${user.id}`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Google callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/google/error?message=${encodeURIComponent('Authentication failed')}`);
  }
};

module.exports = {
  googleAuth,
  getGoogleAuthUrl,
  googleCallback,
};
