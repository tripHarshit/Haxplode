# Haxplode Backend

A production-ready Node.js Express backend with Azure SQL Database and MongoDB integration, designed for hackathon management systems.

## 🚀 Features

- **Dual Database Architecture**: Azure SQL for structured data, MongoDB for unstructured data
- **JWT Authentication**: Secure role-based access control (Participant, Organizer, Judge)
- **MVC Architecture**: Clean separation of concerns with controllers, models, and routes
- **Comprehensive API**: Full CRUD operations for events, teams, submissions, and more
- **File Upload Support**: Multer integration for project submissions and attachments
- **Input Validation**: Joi-based request validation with detailed error messages
- **Security**: Helmet, CORS, rate limiting, and input sanitization
- **Production Ready**: Error handling, logging, and graceful shutdown

## 🏗️ Architecture

```
backend/
├── config/           # Database configurations
├── controllers/      # Business logic handlers
├── middleware/       # Custom middleware (auth, validation, etc.)
├── models/          # Database models
│   ├── sql/        # Azure SQL models (Sequelize)
│   └── mongo/      # MongoDB models (Mongoose)
├── routes/          # API route definitions
├── utils/           # Utility functions
├── uploads/         # File upload storage
├── server.js        # Main application entry point
└── package.json     # Dependencies and scripts
```

## 🛠️ Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Databases**: 
  - Azure SQL Database (Sequelize ORM)
  - MongoDB (Mongoose ODM)
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: Joi schema validation
- **File Upload**: Multer
- **Security**: Helmet, CORS, rate limiting
- **Logging**: Morgan
- **Compression**: Gzip compression

## 📋 Prerequisites

- Node.js 18+ 
- Azure SQL Database
- MongoDB (local or Atlas)
- npm or yarn

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the environment template and configure your variables:

```bash
cp env.example .env
```

Edit `.env` with your database credentials:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Azure SQL Database
AZURE_SQL_SERVER=your-server.database.windows.net
AZURE_SQL_DATABASE=your-database
AZURE_SQL_USERNAME=your-username
AZURE_SQL_PASSWORD=your-password

# MongoDB
MONGODB_URI=mongodb://localhost:27017/haxplode
```

### 3. Database Setup

#### Azure SQL Database
- Create a database in Azure SQL
- Update connection details in `.env`
- The application will auto-create tables on first run

#### MongoDB
- Install MongoDB locally or use MongoDB Atlas
- Update `MONGODB_URI` in `.env`

### 4. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | User registration | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/refresh-token` | Refresh JWT token | No |
| GET | `/api/auth/profile` | Get user profile | Yes |
| PUT | `/api/auth/profile` | Update user profile | Yes |
| PUT | `/api/auth/change-password` | Change password | Yes |
| POST | `/api/auth/logout` | User logout | Yes |

### Events Endpoints

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/api/events` | Get all events | No | - |
| GET | `/api/events/:id` | Get event by ID | No | - |
| POST | `/api/events` | Create event | Yes | Organizer |
| PUT | `/api/events/:id` | Update event | Yes | Organizer |
| DELETE | `/api/events/:id` | Delete event | Yes | Organizer |
| PATCH | `/api/events/:id/status` | Change event status | Yes | Organizer |

### Teams Endpoints

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/api/teams/event/:eventId` | Get teams for event | No | - |
| GET | `/api/teams/:id` | Get team by ID | No | - |
| POST | `/api/teams` | Create team | Yes | Participant |
| PUT | `/api/teams/:id` | Update team | Yes | Participant |
| POST | `/api/teams/:teamId/members` | Add team member | Yes | Participant |
| DELETE | `/api/teams/:teamId/members/:userId` | Remove team member | Yes | Participant |

### Submissions Endpoints

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/api/submissions/event/:eventId` | Get submissions for event | No | - |
| GET | `/api/submissions/:id` | Get submission by ID | No | - |
| POST | `/api/submissions` | Create submission | Yes | Participant |
| PUT | `/api/submissions/:id` | Update submission | Yes | Participant |
| PATCH | `/api/submissions/:id/status` | Change submission status | Yes | Organizer/Judge |

### Announcements Endpoints

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/api/announcements/event/:eventId` | Get announcements for event | No | - |
| GET | `/api/announcements/:id` | Get announcement by ID | No | - |
| POST | `/api/announcements` | Create announcement | Yes | Organizer |
| PUT | `/api/announcements/:id` | Update announcement | Yes | Organizer |
| DELETE | `/api/announcements/:id` | Delete announcement | Yes | Organizer |

### Chat Endpoints

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/api/chats/event/:eventId` | Get chat messages for event | No | - |
| GET | `/api/chats/event/:eventId/questions` | Get questions for event | No | - |
| POST | `/api/chats` | Send chat message | Yes | - |
| PUT | `/api/chats/:id` | Update message | Yes | - |
| DELETE | `/api/chats/:id` | Delete message | Yes | - |
| PATCH | `/api/chats/:id/pin` | Pin/unpin message | Yes | Organizer |

### Judges Endpoints

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/api/judges/event/:eventId` | Get judges for event | No | - |
| POST | `/api/judges/assign` | Assign judge to event | Yes | Organizer |
| DELETE | `/api/judges/:judgeId/event/:eventId` | Remove judge from event | Yes | Organizer |
| POST | `/api/judges/score` | Submit score | Yes | Judge |
| GET | `/api/judges/scores/:eventId` | Get event scores | Yes | Organizer |

## 🔐 Authentication & Authorization

### JWT Token Structure
```json
{
  "userId": 123,
  "role": "Participant",
  "type": "access",
  "iat": 1640995200,
  "exp": 1641081600
}
```

### Role-Based Access Control

- **Participant**: Can create teams, submit projects, participate in events
- **Organizer**: Can create/manage events, assign judges, view scores
- **Judge**: Can score submissions, view assigned events

### Protected Routes
All protected routes require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## 📊 Database Schema

### SQL Models (Azure SQL)

#### Users
- Basic user information, authentication, and profile data
- Role-based access control
- Password hashing with bcrypt

#### Events
- Event details, timeline, prizes, and configuration
- Status management (Draft, Published, In Progress, etc.)
- Team size limits and registration settings

#### Teams
- Team information and project details
- Member management with roles (Leader, Member)
- Event association

#### Judges
- Judge profiles and expertise
- Event assignments and roles

### MongoDB Models

#### Submissions
- Project submissions with GitHub links, documentation, and videos
- Scoring and feedback system
- File attachments and metadata

#### Announcements
- Event announcements with scheduling and targeting
- Read tracking and priority levels
- Rich content support

#### Chats
- Q&A system for events
- Message threading and reactions
- Moderation tools for organizers

## 🚀 Deployment

### Azure App Service

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Configure environment variables** in Azure App Service

3. **Deploy** using Azure CLI or GitHub Actions

### Environment Variables for Production

```env
NODE_ENV=production
PORT=process.env.PORT
JWT_SECRET=strong-secret-key
AZURE_SQL_SERVER=your-production-server
MONGODB_URI=your-production-mongodb-uri
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📝 Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run test       # Run test suite
npm run lint       # Run ESLint
npm run migrate    # Run database migrations
```

## 🔧 Configuration

### Rate Limiting
- Default: 100 requests per 15 minutes per IP
- Configurable via environment variables

### File Upload
- Maximum file size: 10MB (configurable)
- Supported formats: Images, PDFs, Documents, Videos
- Organized storage in subdirectories

### CORS
- Configurable origins
- Credentials support enabled
- Production-ready security headers

## 🐛 Error Handling

The application includes comprehensive error handling:

- **Validation Errors**: Detailed field-level error messages
- **Authentication Errors**: Clear JWT-related error messages
- **Database Errors**: Sequelize and Mongoose error handling
- **File Upload Errors**: Size and format validation
- **Global Error Handler**: Consistent error response format

## 📈 Performance

- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Efficient database connection management
- **Compression**: Gzip compression for responses
- **Caching**: Ready for Redis integration

## 🔒 Security Features

- **Helmet**: Security headers
- **Input Validation**: Joi schema validation
- **SQL Injection Protection**: Sequelize ORM
- **XSS Protection**: Input sanitization
- **Rate Limiting**: DDoS protection
- **CORS**: Cross-origin request control

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the error logs

## 🔄 Changelog

### v1.0.0
- Initial release
- Complete hackathon management system
- Dual database architecture
- Role-based authentication
- Comprehensive API endpoints
