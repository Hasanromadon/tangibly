#!/bin/bash
# Development setup script for local Next.js with Docker PostgreSQL

echo "🚀 Setting up development environment..."

# Start PostgreSQL database in Docker
echo "📦 Starting PostgreSQL database..."
docker-compose -f docker-compose.db.yml up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📋 Installing dependencies..."
    npm install
fi

# Push database schema
echo "🗄️ Setting up database schema..."
npx prisma db push

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Seed database with initial data
echo "🌱 Seeding database..."
npm run db:seed

# Start Next.js development server
echo "🎯 Starting Next.js development server..."
npm run dev
