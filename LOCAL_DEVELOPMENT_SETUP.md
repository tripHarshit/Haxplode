# Local Development Setup for Haxplode

## Prerequisites

- Node.js 18+ 
- Docker Desktop (for SQL Server and MongoDB)
- Git

## 1. Clone and Setup

```bash
git clone <your-repo-url>
cd Haxplode-main
```

## 2. Backend Setup

### Install Dependencies
```bash
cd backend
npm install
```

### Environment Variables
Copy `env.example` to `.env`:
```bash
cp env.example .env
```

Edit `.env` with your local values:
```bash
# Database Configuration
AZURE_SQL_SERVER=localhost
AZURE_SQL_DATABASE=haxplode_local
AZURE_SQL_USERNAME=sa
AZURE_SQL_PASSWORD=YourPassword123
AZURE_SQL_PORT=1433
AZURE_SQL_OPTIONS_ENCRYPT=false
AZURE_SQL_OPTIONS_TRUST_SERVER_CERTIFICATE=true

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/haxplode_local

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
FRONTEND_URL=http://localhost:3000

# Server Configuration
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Database sync on startup (creates missing tables)
SQL_SYNC_ON_START=true
```

## 3. Database Setup with Docker

### Start SQL Server
```bash
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourPassword123" \
  -p 1433:1433 --name haxplode-sql \
  -d mcr.microsoft.com/mssql/server:2019-latest
```

### Start MongoDB
```bash
docker run -p 27017:27017 --name haxplode-mongo \
  -d mongo:latest
```

### Verify Databases
```bash
# Check SQL Server
docker exec -it haxplode-sql /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P YourPassword123 \
  -Q "SELECT @@VERSION"

# Check MongoDB
docker exec -it haxplode-mongo mongosh --eval "db.version()"
```

## 4. Frontend Setup

### Install Dependencies
```bash
cd ../frontend
npm install
```

### Environment Variables
Create `.env` file:
```bash
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
VITE_APP_NAME=Haxplode
VITE_APP_VERSION=1.0.0
```

## 5. Start Development Servers

### Terminal 1: Backend
```bash
cd backend
npm run dev
# or
npm start
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

## 6. Google OAuth Setup for Local Development

### Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select your project
3. Enable Google+ API and OAuth2 API
4. Configure OAuth consent screen
5. Create OAuth 2.0 credentials

### Authorized Redirect URIs
Add these to your Google OAuth credentials:
- `http://localhost:3001/api/auth/google/callback`
- `http://localhost:3000/auth/google/callback`

### Update .env
```bash
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

## 7. Test Your Setup

### Backend Health Check
```bash
curl http://localhost:3001/health
```

### Frontend
Open http://localhost:3000 in your browser

### Database Connection
Check backend logs for:
- ✅ Connected to Azure SQL Database
- ✅ Connected to MongoDB

## 8. Common Issues & Solutions

### SQL Server Connection Failed
```bash
# Check if container is running
docker ps

# Restart container
docker restart haxplode-sql

# Check logs
docker logs haxplode-sql
```

### MongoDB Connection Failed
```bash
# Check if container is running
docker ps

# Restart container
docker restart haxplode-mongo

# Check logs
docker logs haxplode-mongo
```

### Port Already in Use
```bash
# Check what's using the port
lsof -i :3001
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database Tables Missing
- Ensure `SQL_SYNC_ON_START=true` in `.env`
- Restart backend server
- Check logs for "Database models synchronized"

## 9. Development Workflow

1. **Start databases**: `docker start haxplode-sql haxplode-mongo`
2. **Start backend**: `cd backend && npm run dev`
3. **Start frontend**: `cd frontend && npm run dev`
4. **Make changes** to code
5. **Test endpoints** in Postman
6. **View frontend** at http://localhost:3000

## 10. Useful Commands

### Docker Management
```bash
# Start all containers
docker start haxplode-sql haxplode-mongo

# Stop all containers
docker stop haxplode-sql haxplode-mongo

# Remove containers (will delete data)
docker rm haxplode-sql haxplode-mongo

# View logs
docker logs haxplode-sql
docker logs haxplode-mongo
```

### Database Reset
```bash
# Stop backend
# Set SQL_SYNC_ON_START=true in .env
# Restart backend
# Tables will be recreated
```

### Clean Install
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

## 11. Environment Summary

| Service | URL | Port |
|---------|-----|------|
| Backend API | http://localhost:3001 | 3001 |
| Frontend | http://localhost:3000 | 3000 |
| SQL Server | localhost | 1433 |
| MongoDB | localhost | 27017 |

## 12. Next Steps

1. ✅ Set up local databases
2. ✅ Configure environment variables
3. ✅ Start development servers
4. 🔄 Set up Google OAuth credentials
5. 🔄 Test authentication endpoints
6. 🔄 Integrate with frontend

Your local development environment is now ready! 🚀
