# Haxplode Testing Guide

## Prerequisites

1. **Backend Setup**:
   - Ensure backend is running on `http://localhost:3000`
   - Database connections (Azure SQL + MongoDB) are configured
   - Environment variables are set correctly

2. **Frontend Setup**:
   - Ensure frontend is running on `http://localhost:5173` (Vite default)
   - Copy `frontend/env.example` to `frontend/.env.local`
   - Update environment variables if needed

## Backend Testing

### 1. Health Check
```bash
curl http://localhost:3000/health
```
**Expected**: `{"status":"ok","timestamp":"..."}`

### 2. Database Connections
Check backend logs for:
- ✅ Azure SQL Database connection established successfully
- ✅ MongoDB connection established successfully

### 3. API Endpoints Testing

#### Authentication
```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "participant"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Hackathons (Events)
```bash
# Get all hackathons
curl http://localhost:3000/api/hackathons

# Create a hackathon (requires organizer token)
curl -X POST http://localhost:3000/api/hackathons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Hackathon",
    "description": "A test hackathon",
    "startDate": "2024-12-01T00:00:00Z",
    "endDate": "2024-12-03T00:00:00Z",
    "registrationDeadline": "2024-11-30T00:00:00Z",
    "maxTeams": 50,
    "maxTeamSize": 4,
    "settings": {
      "allowTeams": true,
      "allowIndividual": false,
      "registrationLimit": 200
    }
  }'
```

#### Teams
```bash
# Create a team
curl -X POST http://localhost:3000/api/teams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Team",
    "eventId": 1,
    "description": "A test team"
  }'

# Get teams
curl http://localhost:3000/api/teams \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Submissions
```bash
# Create a submission
curl -X POST http://localhost:3000/api/submissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "eventId": 1,
    "projectName": "Test Project",
    "projectDescription": "A test project description",
    "technologies": ["React", "Node.js"],
    "githubUrl": "https://github.com/test/project"
  }'

# Get submissions
curl http://localhost:3000/api/submissions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Frontend Testing

### 1. Basic Navigation
1. Open `http://localhost:5173`
2. Navigate to Login/Register pages
3. Test form validation
4. Test responsive design

### 2. Authentication Flow
1. **Register**: Create a new account
2. **Login**: Sign in with existing credentials
3. **Profile**: Update user profile
4. **Logout**: Sign out

### 3. Role-Based Access
Test different user roles:

#### Participant Flow
1. Register as participant
2. Browse hackathons
3. Register for events
4. Create/join teams
5. Submit projects
6. View leaderboard

#### Organizer Flow
1. Register as organizer
2. Create hackathons
3. Manage participants
4. Create announcements
5. View analytics

#### Judge Flow
1. Register as judge
2. View assigned submissions
3. Score submissions
4. Provide feedback

### 4. Real-time Features
1. **Socket Connection**: Check browser console for socket connection status
2. **Live Updates**: Test team updates, announcements, leaderboard changes
3. **Notifications**: Verify real-time notifications work

### 5. File Upload
1. Upload submission files
2. Verify file storage
3. Test file deletion

## Integration Testing

### 1. End-to-End User Journey
1. **Organizer creates hackathon**
2. **Participants register for hackathon**
3. **Participants form teams**
4. **Participants submit projects**
5. **Judges score submissions**
6. **Leaderboard updates automatically**

### 2. Real-time Communication
1. Create announcement as organizer
2. Verify participants receive real-time notification
3. Test team member updates
4. Verify leaderboard updates on new scores

### 3. Error Handling
1. Test invalid login credentials
2. Test unauthorized access attempts
3. Test form validation errors
4. Test network connectivity issues

## Performance Testing

### 1. Load Testing
```bash
# Install artillery for load testing
npm install -g artillery

# Test API endpoints
artillery quick --count 100 --num 10 http://localhost:3000/api/hackathons
```

### 2. Database Performance
- Monitor query execution times
- Check for N+1 query issues
- Verify indexing is working

### 3. Frontend Performance
- Use browser dev tools to check:
  - Page load times
  - Bundle sizes
  - Memory usage
  - Network requests

## Security Testing

### 1. Authentication
- Test JWT token expiration
- Verify refresh token functionality
- Test role-based access control

### 2. Input Validation
- Test SQL injection attempts
- Test XSS attempts
- Test file upload security

### 3. CORS Configuration
- Verify CORS is properly configured
- Test cross-origin requests

## Browser Testing

### Supported Browsers
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Mobile Testing
- Test responsive design on mobile devices
- Verify touch interactions work
- Check mobile-specific features

## Common Issues & Solutions

### Backend Issues
1. **Database Connection Failed**
   - Check environment variables
   - Verify database credentials
   - Check network connectivity

2. **Port Already in Use**
   - Change port in `.env` file
   - Kill existing process using the port

3. **CORS Errors**
   - Verify CORS configuration in backend
   - Check frontend API URL

### Frontend Issues
1. **API Calls Failing**
   - Check API URL in environment variables
   - Verify backend is running
   - Check network tab for errors

2. **Socket Connection Failed**
   - Verify socket URL configuration
   - Check backend socket setup
   - Verify authentication token

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check for missing dependencies
   - Verify environment variables

## Testing Checklist

### Backend
- [ ] Health check endpoint responds
- [ ] Database connections established
- [ ] All API endpoints return expected responses
- [ ] Authentication works correctly
- [ ] File uploads work
- [ ] Real-time features function
- [ ] Error handling works properly

### Frontend
- [ ] Application loads without errors
- [ ] Authentication flow works
- [ ] Role-based routing functions
- [ ] All forms submit correctly
- [ ] Real-time updates work
- [ ] File uploads function
- [ ] Responsive design works
- [ ] Error messages display properly

### Integration
- [ ] End-to-end user flows work
- [ ] Real-time communication functions
- [ ] Data consistency maintained
- [ ] Performance is acceptable
- [ ] Security measures work

## Deployment Testing

### Pre-deployment
1. Run all tests locally
2. Verify environment variables for production
3. Check build process
4. Test with production-like data

### Post-deployment
1. Verify all endpoints work
2. Test authentication flow
3. Check database connections
4. Monitor error logs
5. Test real-time features
6. Verify file uploads work

## Monitoring & Logging

### Backend Logs
- Monitor application logs
- Check error rates
- Monitor database performance
- Track API response times

### Frontend Monitoring
- Monitor JavaScript errors
- Track page load times
- Monitor API call success rates
- Check user interactions

This testing guide ensures comprehensive coverage of all mandatory features before deployment.
