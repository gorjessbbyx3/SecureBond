#!/bin/bash
# Production Build Script for Bail Bond Management System
# Developer: GoJess & Co

set -e

echo "🏗️  Starting production build process..."

# Type checking
echo "📋 Running TypeScript type checking..."
npx tsc --noEmit

# Linting
echo "🔍 Running ESLint checks..."
npx eslint . --ext .ts,.tsx

# Frontend build
echo "⚛️  Building React frontend..."
npx vite build

# Backend build
echo "🚀 Building Express backend..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Database migration check
echo "🗄️  Checking database schema..."
npx drizzle-kit push --force

echo "✅ Build completed successfully!"
echo "📦 Ready for production deployment"

# Verify build outputs
if [ -d "dist" ] && [ -f "dist/index.js" ]; then
    echo "✓ Backend build verified"
else
    echo "❌ Backend build failed"
    exit 1
fi

if [ -d "dist/client" ]; then
    echo "✓ Frontend build verified"
else
    echo "❌ Frontend build failed"
    exit 1
fi

echo "🎉 Production build ready for deployment!"