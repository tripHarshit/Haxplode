#!/bin/bash

# Haxplode Local Development Startup Script
# This script starts the required services for local development

echo "🚀 Starting Haxplode Local Development Environment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker Desktop first.${NC}"
    exit 1
fi

# Start SQL Server container
echo -e "${YELLOW}📦 Starting SQL Server container...${NC}"
if ! docker ps -q -f name=haxplode-sql | grep -q .; then
    if docker ps -aq -f name=haxplode-sql | grep -q .; then
        docker start haxplode-sql
    else
        docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourPassword123" \
            -p 1433:1433 --name haxplode-sql \
            -d mcr.microsoft.com/mssql/server:2019-latest
    fi
else
    echo -e "${GREEN}✅ SQL Server container is already running${NC}"
fi

# Start MongoDB container
echo -e "${YELLOW}📦 Starting MongoDB container...${NC}"
if ! docker ps -q -f name=haxplode-mongo | grep -q .; then
    if docker ps -aq -f name=haxplode-mongo | grep -q .; then
        docker start haxplode-mongo
    else
        docker run -p 27017:27017 --name haxplode-mongo \
            -d mongo:latest
    fi
else
    echo -e "${GREEN}✅ MongoDB container is already running${NC}"
fi

# Wait for containers to be ready
echo -e "${YELLOW}⏳ Waiting for containers to be ready...${NC}"
sleep 10

# Check container status
echo -e "${YELLOW}🔍 Checking container status...${NC}"
if docker ps -q -f name=haxplode-sql | grep -q . && docker ps -q -f name=haxplode-mongo | grep -q .; then
    echo -e "${GREEN}✅ All containers are running${NC}"
else
    echo -e "${RED}❌ Some containers failed to start${NC}"
    docker ps -a
    exit 1
fi

echo -e "${GREEN}🎉 Local development environment is ready!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Copy backend/env.example to backend/.env and configure your settings"
echo "2. Copy frontend/env.example to frontend/.env"
echo "3. In terminal 1: cd backend && npm run dev"
echo "4. In terminal 2: cd frontend && npm run dev"
echo ""
echo -e "${GREEN}Services:${NC}"
echo "• Backend API: http://localhost:3001"
echo "• Frontend: http://localhost:3000"
echo "• SQL Server: localhost:1433"
echo "• MongoDB: localhost:27017"
echo ""
echo -e "${YELLOW}To stop containers:${NC}"
echo "docker stop haxplode-sql haxplode-mongo"
echo ""
echo -e "${YELLOW}To view logs:${NC}"
echo "docker logs haxplode-sql"
echo "docker logs haxplode-mongo"
