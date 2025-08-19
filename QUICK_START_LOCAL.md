# 🚀 Quick Start - Local Development

## 1. Start Local Services
```bash
# Make sure Docker Desktop is running, then:
./start-local.sh
```

## 2. Setup Environment Files
```bash
# Backend
cd backend
cp env.example .env
# Edit .env with your Google OAuth credentials

# Frontend  
cd ../frontend
cp env.example .env
```

## 3. Start Development Servers

### Terminal 1: Backend
```bash
cd backend
npm run dev
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

## 4. Test Your Setup
- Backend: http://localhost:3001/health
- Frontend: http://localhost:3000
- Postman: Test your API endpoints

## 🎯 What You Get
- ✅ SQL Server running on localhost:1433
- ✅ MongoDB running on localhost:27017  
- ✅ Backend API on localhost:3001
- ✅ Frontend on localhost:3000
- ✅ Google OAuth ready
- ✅ Database tables auto-created

## 🔧 Troubleshooting
- **Ports in use**: Kill processes with `lsof -i :3001` then `kill -9 <PID>`
- **Docker issues**: Restart Docker Desktop
- **Database connection**: Check container logs with `docker logs haxplode-sql`

Your local dev environment is ready! 🎉
