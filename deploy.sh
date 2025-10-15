#!/bin/bash

# IELTS Band Estimator - VPS Deployment Script
# Run this script on your Ubuntu VPS to automatically set up the application

set -e  # Exit on any error

echo "🚀 IELTS Band Estimator - VPS Deployment Script"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

print_header "📋 Step 1: System Update"
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

print_header "🐳 Step 2: Install Docker"
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker..."
    sudo apt install -y docker.io docker-compose
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER
    print_status "Docker installed successfully!"
else
    print_status "Docker already installed"
fi

print_header "🔧 Step 3: Install Go"
if ! command -v go &> /dev/null; then
    print_status "Installing Go 1.21.4..."
    cd /tmp
    wget https://go.dev/dl/go1.21.4.linux-amd64.tar.gz
    sudo tar -C /usr/local -xzf go1.21.4.linux-amd64.tar.gz
    echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
    export PATH=$PATH:/usr/local/go/bin
    print_status "Go installed successfully!"
else
    print_status "Go already installed"
fi

print_header "📦 Step 4: Install Node.js"
if ! command -v node &> /dev/null; then
    print_status "Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    print_status "Node.js installed successfully!"
else
    print_status "Node.js already installed"
fi

print_header "🌐 Step 5: Install Nginx"
if ! command -v nginx &> /dev/null; then
    print_status "Installing Nginx..."
    sudo apt install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    print_status "Nginx installed successfully!"
else
    print_status "Nginx already installed"
fi

print_header "📁 Step 6: Clone Repository"
REPO_DIR="$HOME/ieltswritingscoring"
if [ ! -d "$REPO_DIR" ]; then
    print_status "Cloning repository..."
    cd $HOME
    git clone https://github.com/bobys16/ieltswritingscoring.git
    cd ieltswritingscoring
else
    print_status "Repository already exists, updating..."
    cd $REPO_DIR
    git pull origin main
fi

print_header "⚙️  Step 7: Environment Configuration"
ENV_FILE="$REPO_DIR/apps/api/.env"
if [ ! -f "$ENV_FILE" ]; then
    print_status "Creating environment file..."
    cp apps/api/.env.example apps/api/.env
    
    print_warning "🔑 IMPORTANT: You need to configure the following in $ENV_FILE:"
    echo "   - AI_KEY: Your OpenAI API key"
    echo "   - JWT_SECRET: A secure random string"
    echo "   - DB_DSN: Database connection string"
    echo "   - PUBLIC_BASE_URL: Your domain"
    echo ""
    print_warning "Press ENTER when you've configured these values..."
    read -r
else
    print_status "Environment file already exists"
fi

print_header "🔨 Step 8: Build Application"
print_status "Building Go API..."
cd apps/api
go mod tidy
go build -o ielts-api .

print_status "Building React frontend..."
cd ../web
npm install
npm run build

cd $REPO_DIR

print_header "🐳 Step 9: Docker Deployment"
print_status "Starting services with Docker Compose..."
docker-compose -f infra/docker-compose.yml up --build -d

print_status "Waiting for services to start..."
sleep 10

print_header "🌐 Step 10: Nginx Configuration"
NGINX_CONFIG="/etc/nginx/sites-available/ielts-estimator"
if [ ! -f "$NGINX_CONFIG" ]; then
    print_status "Creating Nginx configuration..."
    
    read -p "Enter your domain name (e.g., example.com): " DOMAIN_NAME
    
    sudo tee $NGINX_CONFIG > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;

    # Frontend (React app)
    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # API endpoints
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
}
EOF

    sudo ln -s $NGINX_CONFIG /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl reload nginx
    print_status "Nginx configured successfully!"
else
    print_status "Nginx configuration already exists"
fi

print_header "🔒 Step 11: Firewall Setup"
print_status "Configuring UFW firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
echo "y" | sudo ufw enable

print_header "✅ Step 12: Health Checks"
print_status "Checking service health..."

# Check Docker containers
print_status "Docker containers status:"
docker-compose -f infra/docker-compose.yml ps

# Check API health
sleep 5
if curl -s http://localhost:8080/health > /dev/null; then
    print_status "✅ API is healthy"
else
    print_warning "⚠️  API health check failed"
fi

# Check frontend
if curl -s http://localhost:5173 > /dev/null; then
    print_status "✅ Frontend is healthy"
else
    print_warning "⚠️  Frontend health check failed"
fi

print_header "🎉 Deployment Complete!"
echo ""
print_status "Your IELTS Band Estimator is now deployed!"
echo ""
echo "📋 Next Steps:"
echo "  1. Point your domain DNS to this server's IP"
echo "  2. Set up SSL certificate with: sudo certbot --nginx -d $DOMAIN_NAME"
echo "  3. Update your environment variables in: $ENV_FILE"
echo "  4. Test your application at: http://$DOMAIN_NAME"
echo ""
echo "📊 Useful Commands:"
echo "  - View logs: docker-compose -f infra/docker-compose.yml logs -f"
echo "  - Restart services: docker-compose -f infra/docker-compose.yml restart"
echo "  - Update app: cd $REPO_DIR && git pull && docker-compose -f infra/docker-compose.yml up --build -d"
echo ""
echo "🔧 Configuration Files:"
echo "  - API Environment: $ENV_FILE"
echo "  - Nginx Config: $NGINX_CONFIG"
echo "  - Docker Compose: $REPO_DIR/infra/docker-compose.yml"
echo ""
print_status "🚀 Happy IELTS scoring!"
