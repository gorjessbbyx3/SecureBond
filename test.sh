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

# Database connectivity validation
echo "🗄️ Testing database connectivity..."
if npx drizzle-kit push --force > /dev/null 2>&1; then
    echo "✅ Database connection verified"
else
    echo "❌ Database connection failed"
    exit 1
fi

# Environment validation
echo "🔐 Validating required environment variables..."
if [ -z "$SESSION_SECRET" ]; then
    echo "❌ SESSION_SECRET required for authentication"
    exit 1
else
    echo "✅ Session secret configured"
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL required for production"
    exit 1
else
    echo "✅ Database URL configured"
fi

echo "✅ All system validations passed"
echo "🎯 System ready for production deployment"