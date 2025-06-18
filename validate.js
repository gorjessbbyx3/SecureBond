#!/usr/bin/env node
// Production Validation Script - Bail Bond Management System
// Developer: GoJess & Co

import fs from 'fs';
import path from 'path';

console.log('🧪 Starting production validation...');

// Check critical files exist
const criticalFiles = [
  'server/index.ts',
  'client/src/App.tsx',
  'shared/schema.ts',
  'server/routes.ts',
  'server/storage.ts'
];

let validationPassed = true;

console.log('📁 Checking critical files...');
criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ Missing: ${file}`);
    validationPassed = false;
  }
});

// Check package.json dependencies
console.log('📦 Validating dependencies...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = ['react', 'express', 'drizzle-orm', 'typescript'];

requiredDeps.forEach(dep => {
  if (packageJson.dependencies[dep] || packageJson.devDependencies?.[dep]) {
    console.log(`✅ ${dep}`);
  } else {
    console.log(`❌ Missing dependency: ${dep}`);
    validationPassed = false;
  }
});

// Check environment variables
console.log('🔐 Checking environment configuration...');
const requiredEnvVars = ['DATABASE_URL', 'SESSION_SECRET'];

requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar} configured`);
  } else {
    console.log(`⚠️  ${envVar} not set`);
  }
});

// Check build configuration
console.log('🏗️  Validating build configuration...');
if (fs.existsSync('vite.config.ts')) {
  console.log('✅ Vite configuration found');
} else {
  console.log('❌ Missing vite.config.ts');
  validationPassed = false;
}

if (fs.existsSync('tsconfig.json')) {
  console.log('✅ TypeScript configuration found');
} else {
  console.log('❌ Missing tsconfig.json');
  validationPassed = false;
}

// Check automation scripts
console.log('⚙️  Checking automation scripts...');
const automationFiles = ['build.sh', 'deploy.sh', '.eslintrc.js', 'Makefile'];

automationFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ Missing: ${file}`);
    validationPassed = false;
  }
});

if (validationPassed) {
  console.log('🎉 All validations passed - System ready for production');
  process.exit(0);
} else {
  console.log('❌ Validation failed - Issues detected');
  process.exit(1);
}