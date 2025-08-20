require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const http = require('http');
const jwt = require('jsonwebtoken');

// DB connections
const { connectSQL } = require('./config/sqlDatabase');
const { connectMongo } = require('./config/mongoDatabase');

// Middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Routes
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
const notificationsRoutes = require('./routes/notifications');
const sponsorRoutes = require('./routes/sponsors');
const certificateRoutes = require('./routes/certificateRoutes');

const { setSocketServer } = require('./utils/socket');
const { startSchedulers } = require('./utils/scheduler');

const app = express();
const PORT = process.env.PORT || 3001;
const server = http.createServer(app);
let io; // Socket.io server

// ---------------- Security & Middleware ----------------
app.use(helmet());

// Allowed origins (local + Azure Static Web Apps)
const allowedOrigins = [
  process.env.FRONTEND_URL, // prod frontend URL
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`❌ Blocked CORS request from: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// Preflight
app.options('*', cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Body parsing & compression
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());
app.use('/uploads', express.static('uploads'));

// Logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
else app.use(morgan('combined'));

// ---------------- Health Check ----------------
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// ---------------- API Routes ----------------
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

// ---------------- Start Server ----------------
async function startServer() {
  try {
    await connectSQL();
    console.log('✅ Connected to Azure SQL Database');

    try {
      const { Certificate } = require('./models/sql');
      await Certificate.count();
      console.log('✅ Certificate table verified');
    } catch (err) {
      console.error('❌ Certificate table verification failed:', err.message);
    }

    await connectMongo();
    console.log('✅ Connected to MongoDB');

    // Initialize Socket.io
    const { Server } = require('socket.io');
    io = new Server(server, {
      cors: {
        origin: allowedOrigins,
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
      socket.on('join_room', ({ roomType, roomId }) => {
        if (!roomType || !roomId) return;
        socket.join(`${roomType}:${roomId}`);
      });
      socket.on('typing', ({ roomId, userId }) => {
        if (roomId) socket.to(roomId).emit('typing', { userId });
      });
      socket.on('disconnect', () => {});
    });

    setSocketServer(io);
    startSchedulers();

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`⚙️  CORS allowed origins: ${allowedOrigins.join(', ')}`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));

startServer();
