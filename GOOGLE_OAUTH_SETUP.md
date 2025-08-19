# Google OAuth Setup Guide for Haxplode Backend

## 1. Google Cloud Console Setup

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google OAuth2 API

### Step 2: Configure OAuth Consent Screen
1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in required information:
   - App name: "Haxplode"
   - User support email: your email
   - Developer contact information: your email
4. Add scopes: `openid`, `email`, `profile`
5. Add test users if needed

### Step 3: Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Set authorized redirect URIs:
   - For development: `http://localhost:3000/api/auth/google/callback`
   - For production: `https://your-domain.com/api/auth/google/callback`
5. Copy the Client ID and Client Secret

## 2. Environment Variables

Add these to your Azure App Service Configuration:

```bash
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-domain.com/api/auth/google/callback
FRONTEND_URL=https://your-frontend-domain.com
```

## 3. API Endpoints

### Get Google OAuth URL
- **GET** `/api/auth/google/url`
- **Response**: Returns the Google OAuth URL for frontend redirect

### Google OAuth Authentication
- **POST** `/api/auth/google`
- **Body**:
```json
{
  "idToken": "google-id-token-from-frontend",
  "role": "Participant" // Optional, defaults to "Participant"
}
```

### Google OAuth Callback (Server-side flow)
- **GET** `/api/auth/google/callback?code=authorization_code`
- **Response**: Redirects to frontend with tokens

## 4. Frontend Integration

### Option 1: Google Sign-In Button (Recommended)
```javascript
// Load Google Sign-In API
<script src="https://accounts.google.com/gsi/client" async defer></script>

// Initialize Google Sign-In
google.accounts.id.initialize({
  client_id: 'YOUR_GOOGLE_CLIENT_ID',
  callback: handleCredentialResponse
});

// Handle the response
async function handleCredentialResponse(response) {
  try {
    const result = await fetch('/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idToken: response.credential,
        role: 'Participant' // Optional
      })
    });
    
    const data = await result.json();
    if (data.success) {
      // Store tokens and redirect
      localStorage.setItem('token', data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
      // Redirect to dashboard
    }
  } catch (error) {
    console.error('Google auth failed:', error);
  }
}

// Render the button
google.accounts.id.renderButton(
  document.getElementById("google-signin-button"),
  { theme: "outline", size: "large" }
);
```

### Option 2: Redirect Flow
```javascript
// Get OAuth URL
async function getGoogleAuthUrl() {
  const response = await fetch('/api/auth/google/url');
  const data = await response.json();
  if (data.success) {
    window.location.href = data.data.authUrl;
  }
}

// Handle callback (on your callback page)
function handleCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const accessToken = urlParams.get('accessToken');
  const refreshToken = urlParams.get('refreshToken');
  
  if (accessToken) {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    // Redirect to dashboard
  }
}
```

## 5. Testing in Postman

### Test Google OAuth URL
- **Method**: GET
- **URL**: `https://your-backend.com/api/auth/google/url`
- **Expected Response**:
```json
{
  "success": true,
  "data": {
    "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?...",
    "redirectUri": "https://your-domain.com/api/auth/google/callback"
  }
}
```

### Test Google Authentication (with ID Token)
- **Method**: POST
- **URL**: `https://your-backend.com/api/auth/google`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE...",
  "role": "Participant"
}
```

## 6. Security Considerations

1. **HTTPS Only**: Always use HTTPS in production
2. **Token Validation**: Backend validates Google ID tokens
3. **Email Verification**: Only verified Google emails are accepted
4. **Role Assignment**: Users can specify their role during signup
5. **Password Generation**: Secure random passwords for Google users

## 7. Troubleshooting

### Common Issues:
1. **"Invalid Google token"**: Check GOOGLE_CLIENT_ID in env vars
2. **"Google email must be verified"**: User must verify email in Google account
3. **CORS errors**: Ensure FRONTEND_URL is set correctly
4. **Redirect URI mismatch**: Check Google Cloud Console redirect URIs

### Debug Steps:
1. Check Azure App Service logs
2. Verify environment variables
3. Test with Google's token info endpoint
4. Check CORS configuration

## 8. Production Deployment

1. Update Google Cloud Console with production redirect URIs
2. Set environment variables in Azure App Service
3. Ensure HTTPS is enabled
4. Test the complete OAuth flow
5. Monitor logs for any authentication errors

## 9. Frontend Routes to Create

Create these routes in your frontend:
- `/auth/google/callback` - Handle OAuth callback
- `/auth/google/success` - Success page after authentication
- `/auth/google/error` - Error page for failed authentication

## 10. Complete Flow Example

1. User clicks "Sign in with Google"
2. Frontend redirects to Google OAuth URL
3. User authenticates with Google
4. Google redirects back to your callback URL
5. Backend exchanges code for tokens
6. Backend creates/updates user and generates JWT tokens
7. User is redirected to success page with tokens
8. Frontend stores tokens and redirects to dashboard
