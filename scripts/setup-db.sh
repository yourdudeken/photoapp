#!/bin/bash

# PhotoApp Database Setup Script

echo "🗄️  Setting up PhotoApp Database..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start PostgreSQL database
echo "📦 Starting PostgreSQL database..."
docker-compose up db -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Check if database is running
if docker-compose ps db | grep -q "Up"; then
    echo "✅ Database is running!"
    echo ""
    echo "Database connection details:"
    echo "  Host: localhost"
    echo "  Port: 5432"
    echo "  Database: photoapp"
    echo "  User: postgres"
    echo "  Password: postgres"
    echo ""
    echo "🚀 You can now run: npm run dev"
else
    echo "❌ Failed to start database"
    exit 1
fi
