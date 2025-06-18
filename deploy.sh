#!/bin/bash
# Production Deployment Script for Bail Bond Management System
# Developer: GoJess & Co

set -e

echo "🚀 Starting production deployment process..."

# Run full build process
echo "📦 Executing production build..."
./build.sh

# Environment validation
echo "🔐 Validating environment variables..."
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  Warning: DATABASE_URL not set"
fi

if [ -z "$RAPIDAPI_KEY" ]; then
    echo "⚠️  Warning: RAPIDAPI_KEY not set (location services will use basic GPS only)"
fi

if [ -z "$SESSION_SECRET" ]; then
    echo "❌ Error: SESSION_SECRET required for authentication"
    exit 1
fi

# Database initialization
echo "🗄️  Initializing database..."
npx drizzle-kit push --force

# Start production server
echo "🌐 Starting production server..."
NODE_ENV=production node dist/index.js &

# Health check
echo "🏥 Performing health check..."
sleep 5

if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Deployment successful - Server is healthy"
    echo "🎯 Admin access: username 'admin', password 'admin123'"
    echo "👥 Client access: any client ID with password 'client123'"
else
    echo "❌ Deployment failed - Health check failed"
    exit 1
fi

echo "🎉 Production deployment complete!"
echo "📊 Monitor system at: http://localhost:5000/admin-dashboard"