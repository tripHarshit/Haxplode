#!/bin/bash

echo "🚀 Haxplode Quick Start Script"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use"
        return 1
    else
        echo "✅ Port $1 is available"
        return 0
    fi
}

# Check ports
echo ""
echo "🔍 Checking port availability..."
check_port 3000
check_port 5173

# Backend setup
echo ""
echo "🔧 Setting up Backend..."
cd backend

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cp env.example .env
    echo "⚠️  Please update backend/.env with your database credentials"
else
    echo "✅ .env file exists"
fi

# Install dependencies
echo "📦 Installing backend dependencies..."
npm install

# Check if uploads directory exists
if [ ! -d uploads ]; then
    echo "📁 Creating uploads directory..."
    mkdir uploads
fi

cd ..

# Frontend setup
echo ""
echo "🔧 Setting up Frontend..."
cd frontend

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file from example..."
    cp env.example .env.local
    echo "✅ .env.local file created"
else
    echo "✅ .env.local file exists"
fi

# Install dependencies
echo "📦 Installing frontend dependencies..."
npm install

cd ..

echo ""
echo "🎉 Setup Complete!"
echo "================================"
echo ""
echo "📋 Next Steps:"
echo "1. Update backend/.env with your database credentials"
echo "2. Update frontend/.env.local if needed"
echo "3. Start the backend: cd backend && npm start"
echo "4. Start the frontend: cd frontend && npm run dev"
echo ""
echo "🌐 URLs:"
echo "   Backend: http://localhost:3000"
echo "   Frontend: http://localhost:5173"
echo "   Health Check: http://localhost:3000/health"
echo ""
echo "📚 Documentation:"
echo "   Testing Guide: TESTING_GUIDE.md"
echo "   Deployment Guide: DEPLOYMENT_GUIDE.md"
echo ""
echo "🔍 Testing Commands:"
echo "   Backend Health: curl http://localhost:3000/health"
echo "   API Test: curl http://localhost:3000/api/hackathons"
echo ""
echo "Happy coding! 🚀"
