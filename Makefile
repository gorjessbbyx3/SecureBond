# Bail Bond Management System - Production Automation
# Developer: GoJess & Co

.PHONY: help build lint test deploy clean validate ci

help:
	@echo "Available commands:"
	@echo "  build    - Build production artifacts"
	@echo "  lint     - Run code quality checks"
	@echo "  test     - Run system validation"
	@echo "  deploy   - Deploy to production"
	@echo "  validate - Run all validation checks"
	@echo "  ci       - Continuous integration pipeline"
	@echo "  clean    - Remove build artifacts"

build:
	@echo "Building production system..."
	./build.sh

lint:
	@echo "Running code quality checks..."
	npx eslint . --ext .ts,.tsx

test:
	@echo "Running system validation..."
	./test.sh

deploy:
	@echo "Deploying to production..."
	./deploy.sh

validate:
	@echo "Running validation pipeline..."
	npx tsc --noEmit
	npx eslint . --ext .ts,.tsx

ci: validate build
	@echo "Continuous integration pipeline complete"

clean:
	@echo "Cleaning build artifacts..."
	rm -rf dist/
	rm -rf node_modules/.cache/

install:
	@echo "Installing dependencies..."
	npm install

dev:
	@echo "Starting development server..."
	npm run dev

start:
	@echo "Starting production server..."
	NODE_ENV=production node dist/index.js

check-env:
	@echo "Checking environment variables..."
	@[ ! -z "$$DATABASE_URL" ] || echo "Warning: DATABASE_URL not set"
	@[ ! -z "$$SESSION_SECRET" ] || echo "Error: SESSION_SECRET required"
	@[ ! -z "$$RAPIDAPI_KEY" ] || echo "Warning: RAPIDAPI_KEY not set"