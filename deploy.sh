#!/bin/bash

# Deployment script for VPS
set -e

echo "🚀 Starting deployment..."

# Pull latest changes
git pull origin main

# Stop existing containers
echo "⏹️  Stopping existing containers..."
docker-compose down

# Build and start containers
echo "🏗️  Building and starting containers..."
docker-compose up -d --build

# Run database migrations
echo "📊 Running database migrations..."
sleep 10  # Wait for database to be ready
docker-compose exec -T app npm run db:push

echo "✅ Deployment completed successfully!"
echo "🌐 Application is running at http://your-domain.com"