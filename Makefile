# IELTS Band Estimator - Development & Deployment
.PHONY: help dev build up down logs clean test docker-build docker-up docker-down

# Default target
help: ## Show this help message
	@echo "IELTS Band Estimator - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development commands
dev: ## Start development servers (frontend and backend)
	@echo "🚀 Starting development servers..."
	@make -j2 dev-web dev-api

dev-web: ## Start frontend development server
	@echo "🌐 Starting frontend development server..."
	@cd apps/web && npm run dev

dev-api: ## Start backend development server
	@echo "🔧 Starting backend development server..."
	@cd apps/api && go run main.go

install: ## Install dependencies for both frontend and backend
	@echo "📦 Installing dependencies..."
	@cd apps/web && npm install
	@cd apps/api && go mod download

# Production deployment commands
build: ## Build Docker images
	@echo "🔨 Building Docker images..."
	@cd infra && docker-compose build

up: ## Start production environment with Docker
	@echo "🚀 Starting production environment..."
	@cd infra && ./deploy.sh

down: ## Stop production environment
	@echo "🛑 Stopping production environment..."
	@cd infra && docker-compose down

logs: ## View logs from all services
	@echo "📋 Viewing logs..."
	@cd infra && docker-compose logs -f

clean: ## Clean up Docker containers, volumes, and images
	@echo "🗑️  Cleaning up..."
	@cd infra && docker-compose down -v --rmi all

# Testing commands
test: ## Run tests for both frontend and backend
	@echo "🧪 Running tests..."
	@make test-web test-api

test-web: ## Run frontend tests
	@echo "🧪 Running frontend tests..."
	@cd apps/web && npm test

test-api: ## Run backend tests
	@echo "🧪 Running backend tests..."
	@cd apps/api && go test ./...

# Docker specific commands
docker-build: ## Build Docker images without starting
	@echo "🔨 Building Docker images..."
	@cd infra && docker-compose build --no-cache

docker-up: ## Start Docker containers in detached mode
	@echo "🐳 Starting Docker containers..."
	@cd infra && docker-compose up -d

docker-down: ## Stop Docker containers
	@echo "🐳 Stopping Docker containers..."
	@cd infra && docker-compose down

# Database commands
db-migrate: ## Run database migrations
	@echo "🗄️  Running database migrations..."
	@cd apps/api && go run main.go migrate

db-reset: ## Reset database (CAUTION: This will delete all data)
	@echo "⚠️  Resetting database..."
	@cd infra && docker-compose down -v
	@cd infra && docker-compose up -d db
	@sleep 5
	@make db-migrate

# Utility commands
fmt: ## Format code (Go and JavaScript/TypeScript)
	@echo "✨ Formatting code..."
	@cd apps/api && go fmt ./...
	@cd apps/web && npm run format

lint: ## Lint code
	@echo "🔍 Linting code..."
	@cd apps/api && golangci-lint run
	@cd apps/web && npm run lint

security: ## Run security checks
	@echo "🔒 Running security checks..."
	@cd apps/api && gosec ./...
	@cd apps/web && npm audit

# Quick development setup
setup: ## Complete development setup (install dependencies, build, etc.)
	@echo "⚡ Setting up development environment..."
	@make install
	@echo "✅ Development environment ready!"
	@echo ""
	@echo "Run 'make dev' to start development servers"
	@echo "Run 'make up' to start production environment"

# Status check
status: ## Check status of all services
	@echo "📊 Checking service status..."
	@echo ""
	@echo "Frontend (dev): http://localhost:5173"
	@echo "Backend (dev): http://localhost:8080"
	@echo "Production (nginx): http://localhost:80"
	@echo ""
	@cd infra && docker-compose ps
