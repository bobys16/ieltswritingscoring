#!/bin/bash

# Production Build Script for BandLy
# This script builds both frontend and backend for production deployment

set -e

echo "🏗️  Building BandLy for Production"
echo "================================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[BUILD]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

print_header "📦 Step 1: Building Backend (Go API)"
cd "$SCRIPT_DIR/apps/api"

# Clean previous builds
print_status "Cleaning previous builds..."
rm -f ielts-api main

# Download dependencies
print_status "Downloading Go dependencies..."
go mod tidy
go mod download

# Run tests
print_status "Running tests..."
go test ./internal -v

# Build for Linux (production)
print_status "Building Go binary for Linux..."
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o ielts-api .

# Build for current OS (development)
print_status "Building Go binary for current OS..."
go build -o ielts-api-dev .

print_status "✅ Backend build complete!"
ls -la ielts-api*

print_header "🎨 Step 2: Building Frontend (React)"
cd "$SCRIPT_DIR/apps/web"

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf dist node_modules/.cache

# Install dependencies
print_status "Installing Node.js dependencies..."
npm ci

# Run linting (if available)
if npm run lint --silent 2>/dev/null; then
    print_status "Running ESLint..."
    npm run lint
fi

# Build for production
print_status "Building React app for production..."
npm run build

print_status "✅ Frontend build complete!"
ls -la dist/

# Calculate sizes
DIST_SIZE=$(du -sh dist/ | cut -f1)
print_status "Built frontend size: $DIST_SIZE"

print_header "🐳 Step 3: Building Docker Images"
cd "$SCRIPT_DIR"

# Build API image
print_status "Building API Docker image..."
docker build -t ielts-api:latest apps/api/

# Build Web image  
print_status "Building Web Docker image..."
docker build -t ielts-web:latest apps/web/

print_status "✅ Docker images built successfully!"
docker images | grep "ielts-"

print_header "📋 Step 4: Generating Build Info"
cd "$SCRIPT_DIR"

# Create build info file
BUILD_INFO_FILE="build-info.txt"
cat > "$BUILD_INFO_FILE" << EOF
IELTS Band Estimator - Build Information
========================================

Build Date: $(date)
Git Commit: $(git rev-parse HEAD 2>/dev/null || echo "unknown")
Git Branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

Backend:
- Go Version: $(go version)
- Binary: apps/api/ielts-api
- Docker Image: ielts-api:latest

Frontend:
- Node Version: $(node --version)
- NPM Version: $(npm --version)
- Build Size: $DIST_SIZE
- Docker Image: ielts-web:latest

Files Ready for Deployment:
- apps/api/ielts-api (Linux binary)
- apps/web/dist/ (Static files)
- Docker images: ielts-api:latest, ielts-web:latest

Deployment Options:
1. Docker: docker-compose -f infra/docker-compose.yml up -d
2. Manual: Copy binaries and static files to server
3. Automated: Run deploy.sh on Ubuntu VPS

Environment Variables Required:
- AI_KEY (OpenAI API key)
- JWT_SECRET (Random secure string)
- DB_DSN (Database connection)
- PUBLIC_BASE_URL (Your domain)
EOF

print_status "Build information saved to: $BUILD_INFO_FILE"

print_header "🎉 Build Complete!"
echo ""
echo "📦 Artifacts Generated:"
echo "  - Backend binary: apps/api/ielts-api"
echo "  - Frontend build: apps/web/dist/"
echo "  - Docker images: ielts-api:latest, ielts-web:latest"
echo "  - Build info: $BUILD_INFO_FILE"
echo ""
echo "🚀 Ready for Deployment!"
echo ""
echo "📋 Quick Deploy Commands:"
echo "  Local test: docker-compose -f infra/docker-compose.yml up"
echo "  VPS deploy: scp deploy.sh user@server:~ && ssh user@server './deploy.sh'"
echo "  Manual deploy: Copy files and follow DEPLOYMENT_GUIDE.md"
echo ""
print_status "🎯 Happy deploying!"
