# Haxplode - Hackathon Hosting Platform

A modern, full-stack hackathon and event hosting platform built with React, Node.js, and Azure. Haxplode provides a comprehensive solution for organizing, participating in, and judging hackathons with real-time collaboration features.

## 🌐 Live Demo

**Access the live application:** [https://salmon-sea-0fd40ca00.1.azurestaticapps.net/](https://salmon-sea-0fd40ca00.1.azurestaticapps.net/)

## 🚀 Features

### 🔐 Authentication & Security
- **Google OAuth Integration**: Seamless sign-in with Google accounts
- **JWT-based Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permissions for Participants, Organizers, and Judges
- **Passwordless Registration**: Google users can register without passwords
- **Email Verification**: Automatic email verification for Google accounts

### 📱 Multi-Role Support
- **Participants**: Register for hackathons, join teams, submit projects
- **Organizers**: Create and manage hackathons, view analytics, manage participants
- **Judges**: Can review submissions, provide feedback, score projects

### 🔄 Real-time Features
- **Live Updates**: Socket.io integration for real-time notifications
- **Live Chat**: Real-time communication during hackathons
- **Status Updates**: Live submission and event status updates
- **Notifications**: Real-time notifications for all users

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Dark/Light Theme**: Toggle between themes
- **Modern Components**: Beautiful, accessible UI components
- **Loading States**: Smooth loading animations and skeletons

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with latest features
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **React Router DOM v7** - Client-side routing
- **Axios** - HTTP client with interceptors
- **Socket.io Client** - Real-time communication
- **Lucide React** - Beautiful icons
- **Firebase Auth** - Google OAuth integration

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Sequelize** - SQL ORM
- **Socket.io** - Real-time server
- **JWT** - Authentication tokens
- **Azure SQL Database** - Cloud database
- **MongoDB** - NoSQL database for specific features
- **Multer** - File upload handling

## 👥 Role-Based Features

### 🎯 **Organizer Features**
- **Hackathon Management**
  - Create and edit hackathons with detailed information
  - Set event dates, themes, and prize pools
  - Configure submission guidelines and requirements
  - Manage multiple rounds and phases

- **Participant Management**
  - View and manage participant registrations
  - Approve/reject participant applications
  - Monitor participant activity and engagement
  - Send announcements and notifications

- **Judge Management**
  - Assign judges to specific submissions
  - Manage judge profiles and permissions
  - Monitor judging progress and scores
  - Coordinate judging rounds

- **Analytics & Insights**
  - Real-time analytics dashboard
  - Participant engagement metrics
  - Submission statistics and trends
  - Performance reports and charts

- **Sponsor Management**
  - Add and manage sponsors
  - Display sponsor information and logos
  - Track sponsor contributions
  - Sponsor showcase and recognition

- **Announcements**
  - Create and send announcements
  - Schedule announcements for specific times
  - Target announcements to specific groups
  - Track announcement read rates

### 👨‍💻 **Participant Features**
- **Hackathon Discovery**
  - Browse available hackathons
  - Filter by theme, date, and location
  - View detailed hackathon information
  - Register for hackathons

- **Team Management**
  - Create new teams
  - Join existing teams with team codes
  - Manage team members and roles
  - View team statistics and progress

- **Project Submission**
  - Submit project files and documentation
  - Track submission status
  - Update submissions before deadlines
  - View submission feedback

- **Real-time Updates**
  - Live notifications for events
  - Real-time chat with team members
  - Live updates on hackathon progress
  - Deadline reminders and alerts

- **Certificates & Recognition**
  - Download participation certificates
  - View achievement badges
  - Track participation history
  - Share achievements on social media

- **Q&A & Support**
  - Ask questions to organizers
  - View FAQ and guidelines
  - Get real-time support
  - Access resource materials

### 👨‍⚖️ **Judge Features**
- **Submission Review**
  - View assigned submissions
  - Review project details and files
  - Provide detailed feedback
  - Score submissions based on criteria

- **Scoring System**
  - Use customizable scoring rubrics
  - Provide qualitative feedback
  - Track scoring progress
  - Compare submissions

- **Analytics Dashboard**
  - View judging statistics
  - Track review progress
  - Monitor scoring consistency
  - Generate judging reports

- **Communication**
  - Communicate with other judges
  - Discuss submissions and scores
  - Coordinate judging rounds
  - Provide feedback to organizers

## 📁 Project Structure

```
Haxplode/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── auth/       # Authentication components
│   │   │   ├── common/     # Common layout components
│   │   │   ├── organizer/  # Organizer-specific components
│   │   │   ├── participant/# Participant-specific components
│   │   │   ├── judge/      # Judge-specific components
│   │   │   └── ui/         # Basic UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   ├── context/        # React Context providers
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── backend/                 # Node.js backend application
│   ├── controllers/        # API route controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   ├── config/           # Configuration files
│   └── utils/            # Utility functions
└── docs/                  # Documentation
```

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm or yarn** - Package managers
- **Git** - Version control
- **Azure SQL Database** - For production database
- **MongoDB** - For specific features (optional for local development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Haxplode
   ```

2. **Set up Backend**
   ```bash
   cd backend
   
   # Install dependencies
   npm install
   
   # Copy environment file
   cp env.example .env
   
   # Update environment variables in .env
   # Add your database credentials, Google OAuth keys, etc.
   ```

3. **Set up Frontend**
   ```bash
   cd ../frontend
   
   # Install dependencies
   npm install
   
   # Copy environment file
   cp env.example .env
   
   # Update environment variables in .env
   ```

4. **Configure Environment Variables**

   **Backend (.env):**
   ```env
   PORT=3001
   NODE_ENV=development
   
   # Database
   DB_HOST=your-database-host
   DB_USER=your-database-user
   DB_PASS=your-database-password
   DB_NAME=your-database-name
   
   # JWT
   JWT_SECRET=your-jwt-secret
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   FRONTEND_URL=http://localhost:5173
   
   # MongoDB (optional)
   MONGODB_URI=your-mongodb-uri
   ```

   **Frontend (.env):**
   ```env
   VITE_API_URL=http://localhost:3001/api
   VITE_SOCKET_URL=http://localhost:3001
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   VITE_APP_NAME=Haxplode
   VITE_APP_VERSION=1.0.0
   ```

5. **Start Development Servers**

   **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm run dev
   ```

   **Terminal 2 - Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

6. **Open your browser**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3001`

## 📱 Available Scripts

### Backend Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run build` - Build for production
- `npm test` - Run tests

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔐 Authentication Flow

### Google OAuth Integration
1. **Sign In**: Users click "Continue with Google" button
2. **Authentication**: Google authenticates the user
3. **User Check**: System checks if user exists in database
4. **Existing User**: Direct login with JWT tokens
5. **New User**: Redirect to registration form with pre-filled data
6. **Registration**: User completes profile and selects role
7. **Account Creation**: System creates user account and logs in

### Role Selection
- **Participant**: Can register for hackathons and submit projects
- **Organizer**: Can create and manage hackathons
- **Judge**: Can review and score submissions

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/google` - Google OAuth authentication
- `POST /api/auth/google/complete` - Complete Google registration

### Hackathons
- `GET /api/hackathons` - List all hackathons
- `POST /api/hackathons` - Create new hackathon
- `GET /api/hackathons/:id` - Get hackathon details
- `PUT /api/hackathons/:id` - Update hackathon
- `DELETE /api/hackathons/:id` - Delete hackathon

### Teams
- `GET /api/teams` - List teams
- `POST /api/teams` - Create team
- `GET /api/teams/:id` - Get team details
- `PUT /api/teams/:id` - Update team

### Submissions
- `GET /api/submissions` - List submissions
- `POST /api/submissions` - Create submission
- `GET /api/submissions/:id` - Get submission details
- `PUT /api/submissions/:id` - Update submission

### Judges
- `GET /api/judges` - List judges
- `POST /api/judges` - Create judge
- `GET /api/judges/:id/submissions` - Get assigned submissions

## 🚀 Deployment

### Azure Deployment
The application is currently deployed on Azure with the following configuration:

- **Frontend**: Azure Static Web Apps
- **Backend**: Azure App Service
- **Database**: Azure SQL Database
- **Storage**: Azure Blob Storage

### Environment Variables for Production
```env
# Backend
NODE_ENV=production
PORT=3001
DB_HOST=your-azure-sql-host
DB_USER=your-azure-sql-user
DB_PASS=your-azure-sql-password
DB_NAME=your-azure-sql-database
JWT_SECRET=your-production-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
FRONTEND_URL=https://salmon-sea-0fd40ca00.1.azurestaticapps.net

# Frontend
VITE_API_URL=https://your-backend-url/api
VITE_SOCKET_URL=https://your-backend-url
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permissions per user role
- **Input Validation**: Server-side validation with Joi
- **CORS Protection**: Configured CORS for security
- **Rate Limiting**: API rate limiting to prevent abuse
- **XSS Protection**: Built-in XSS protection
- **CSRF Protection**: CSRF token validation

## 📱 Responsive Design

- **Mobile-first approach** with responsive breakpoints
- **Touch-friendly interfaces** for mobile devices
- **Responsive navigation** with collapsible sidebar
- **Optimized for all screen sizes** from mobile to desktop
- **Progressive Web App** features for better mobile experience

## 🔌 Real-time Features

### Socket.io Integration
- **Live notifications** for all users
- **Real-time chat** during hackathons
- **Live updates** on submission status
- **Real-time analytics** for organizers
- **Live judging progress** for judges

### WebSocket Events
- `user:join` - User joins a room
- `user:leave` - User leaves a room
- `message:send` - Send chat message
- `notification:new` - New notification
- `submission:update` - Submission status update

## 🎯 Key Components

### Authentication Components
- **GoogleAuthButton**: Universal Google sign-in button
- **LoginForm**: Traditional email/password login
- **RegisterForm**: User registration form
- **GoogleRegisterPage**: Passwordless Google registration

### Dashboard Components
- **OrganizerDashboard**: Complete organizer management interface
- **ParticipantDashboard**: Participant activity and progress
- **JudgeDashboard**: Submission review and scoring interface

### Management Components
- **EventCreationWizard**: Step-by-step hackathon creation
- **TeamManagement**: Team creation and management
- **SubmissionForm**: Project submission interface
- **ScoringForm**: Judge scoring interface

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and commit: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style and conventions
- Add tests for new features
- Update documentation for API changes
- Ensure responsive design for all new components

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- **Create an issue** in the repository
- **Contact the development team**
- **Check the documentation** in the `/docs` folder
- **Review the API documentation** for backend endpoints

## 🏆 Live Demo

**Experience Haxplode in action:** [https://salmon-sea-0fd40ca00.1.azurestaticapps.net/](https://salmon-sea-0fd40ca00.1.azurestaticapps.net/)

Built with ❤️ by the Haxplode Team
