# 🚀 Google OAuth Frontend Setup Guide

## ✅ What's Already Done

I've removed all the dummy/mock Google OAuth code and replaced it with real Google OAuth integration:

1. **Updated `authService.js`** - Now calls your backend `/api/auth/google` endpoint
2. **Updated `LoginPage.jsx`** - Real Google Sign-In button with proper initialization
3. **Updated `RegisterPage.jsx`** - Real Google Sign-In button with proper initialization
4. **Updated `AuthContext.jsx`** - Handles real Google OAuth responses

## 🔧 Setup Steps

### 1. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select your project
3. Enable Google+ API and OAuth2 API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Choose "Web application"
6. Add authorized redirect URIs:
   - **Local**: `http://localhost:3000/auth/google/callback`
   - **Production**: `https://your-domain.com/auth/google/callback`
7. Copy your **Client ID**

### 2. Update Frontend Environment

Create/update `frontend/.env`:
```bash
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
VITE_APP_NAME=Haxplode
VITE_APP_VERSION=1.0.0
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 3. Update Backend Environment

Create/update `backend/.env`:
```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

## 🎯 How It Works Now

### Frontend Flow:
1. **User clicks "Continue with Google"**
2. **Google Sign-In popup appears** (handled by Google's API)
3. **User authenticates with Google**
4. **Google returns ID token**
5. **Frontend sends ID token to your backend** (`/api/auth/google`)
6. **Backend verifies token and creates/logs in user**
7. **Backend returns JWT tokens**
8. **User is logged in and redirected to dashboard**

### Backend Flow:
1. **Receives Google ID token**
2. **Verifies token with Google**
3. **Extracts user info (email, name, picture)**
4. **Creates new user or updates existing user**
5. **Generates JWT tokens**
6. **Returns user data and tokens**

## 🧪 Testing

### 1. Start Your Services
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend  
cd frontend && npm run dev
```

### 2. Test Google OAuth
1. Open http://localhost:3000/login
2. Click "Continue with Google"
3. Sign in with your Google account
4. Should redirect to dashboard with real user data

### 3. Test Backend Endpoint
```bash
# Test Google OAuth URL generation
curl http://localhost:3001/api/auth/google/url

# Test Google authentication (with real ID token)
curl -X POST http://localhost:3001/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken": "real-google-id-token"}'
```

## 🔍 Troubleshooting

### Common Issues:

1. **"Google Sign-In is not configured"**
   - Check `VITE_GOOGLE_CLIENT_ID` in frontend `.env`
   - Ensure Google Cloud Console has correct redirect URIs

2. **"Invalid Google token"**
   - Check `GOOGLE_CLIENT_ID` in backend `.env`
   - Verify Google Cloud Console credentials

3. **CORS errors**
   - Ensure `FRONTEND_URL` is set correctly in backend `.env`
   - Check CORS configuration in backend

4. **"Google email must be verified"**
   - User must verify email in Google account
   - Test with a verified Google account

### Debug Steps:

1. **Check browser console** for JavaScript errors
2. **Check backend logs** for authentication errors
3. **Verify environment variables** are loaded correctly
4. **Test Google token** with Google's token info endpoint

## 🚀 Production Deployment

1. **Update Google Cloud Console** with production redirect URIs
2. **Set production environment variables** in your hosting platform
3. **Ensure HTTPS** is enabled (required for Google OAuth)
4. **Test complete OAuth flow** in production environment

## 📱 Mobile Considerations

- Google Sign-In works on mobile browsers
- Consider adding mobile-specific styling
- Test on various devices and screen sizes

## 🔒 Security Notes

- **HTTPS required** in production
- **ID tokens are short-lived** (1 hour)
- **Backend validates** all Google tokens
- **JWT tokens** handle subsequent authentication

## 🎉 You're All Set!

Your frontend now has real Google OAuth integration that:
- ✅ Removes all dummy/mock data
- ✅ Integrates with your backend API
- ✅ Handles real Google authentication
- ✅ Creates/updates users automatically
- ✅ Provides secure JWT-based sessions

Test it out and let me know if you need any adjustments! 🚀
