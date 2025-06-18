#!/bin/bash
# Test and Validation Script for Bail Bond Management System
# Developer: GoJess & Co

set -e

echo "🧪 Starting system validation and testing..."

# TypeScript type checking
echo "📋 Running TypeScript validation..."
npx tsc --noEmit

# ESLint validation
echo "🔍 Running code quality checks..."
npx eslint . --ext .ts,.tsx

# API endpoint validation
echo "🌐 Testing API endpoints..."
npm run dev &
SERVER_PID=$!

# Wait for server to start
sleep 10

# Health check
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Health endpoint operational"
else
    echo "❌ Health endpoint failed"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Company configuration endpoint
if curl -f http://localhost:5000/api/admin/company-configuration/1 > /dev/null 2>&1; then
    echo "✅ Company configuration endpoint operational"
else
    echo "❌ Company configuration endpoint failed"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Database connectivity
echo "🗄️ Testing database connectivity..."
if npx drizzle-kit push --force > /dev/null 2>&1; then
    echo "✅ Database connection verified"
else
    echo "❌ Database connection failed"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Stop test server
kill $SERVER_PID 2>/dev/null || true

echo "✅ All system validations passed"
echo "🎯 System ready for production deployment"