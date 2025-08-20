require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const { connectSQL } = require('./config/sqlDatabase');
// Ensure all SQL models and associations are registered BEFORE syncing
console.log('🔄 Loading SQL models...');
require('./models/sql');
console.log('✅ SQL models loaded');
const { connectMongo } = require('./config/mongoDatabase');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const teamRoutes = require('./routes/teams');
const submissionRoutes = require('./routes/submissions');
const judgeRoutes = require('./routes/judges');
const announcementRoutes = require('./routes/announcements');
const chatRoutes = require('./routes/chats');
const hackathonRoutes = require('./routes/hackathons');
const participantRoutes = require('./routes/participant');
const uploadRoutes = require('./routes/upload');
const { setSocketServer } = require('./utils/socket');
const { startSchedulers } = require('./utils/scheduler');
const notificationsRoutes = require('./routes/notifications');
const sponsorRoutes = require('./routes/sponsors');
const certificateRoutes = require('./routes/certificateRoutes');

const http = require('http');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = process.env.PORT || 3001;
const server = http.createServer(app);
let io; // initialized after DB connections

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Explicitly handle preflight requests early
app.options('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Temporarily increased for testing
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());
// Serve uploaded files statically (read-only)
app.use('/uploads', express.static('uploads'));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/judges', judgeRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/hackathons', hackathonRoutes);
app.use('/api/participant', participantRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/certificates', certificateRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Database connections and server startup
async function startServer() {
  try {
    // Connect to Azure SQL Database
    await connectSQL();
    console.log('✅ Connected to Azure SQL Database');
    
    // Verify Certificate table exists
    try {
      const { Certificate } = require('./models/sql');
      
      // Test if the table exists by doing a simple query
      await Certificate.count();
      console.log('✅ Certificate table verified and accessible');
    } catch (error) {
      console.error('❌ Certificate table verification failed:', error.message);
      console.error('❌ This will cause certificate-related features to fail');
    }

    // Connect to MongoDB
    await connectMongo();
    console.log('✅ Connected to MongoDB');

    // Initialize Socket.io
    const { Server } = require('socket.io');
    io = new Server(server, {
      cors: {
        origin: 'http://localhost:5173', // Temporarily hardcoded for testing
        credentials: true,
      },
    });

    io.use((socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) return next(new Error('Unauthorized'));
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;
        next();
      } catch (err) {
        next(new Error('Unauthorized'));
      }
    });

    io.on('connection', (socket) => {
      // Rooms
      socket.on('join_room', ({ roomType, roomId }) => {
        if (!roomType || !roomId) return;
        socket.join(`${roomType}:${roomId}`);
      });

      socket.on('typing', ({ roomId, userId }) => {
        if (roomId) socket.to(roomId).emit('typing', { userId });
      });

      socket.on('disconnect', () => {});
    });

    // Make io available to controllers
    setSocketServer(io);

    // Start background schedulers (deadline reminders, scheduled announcements)
    startSchedulers();

    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`⚙️  CORS origins allowed: http://localhost:5173, http://localhost:5174, http://localhost:3000`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();
