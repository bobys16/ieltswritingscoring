# IELTS Band Estimator - Ubuntu VPS Deployment Guide

## 🚀 Quick Deployment Commands

### 1. Clone Repository on VPS
```bash
# SSH into your Ubuntu VPS
ssh your-user@your-vps-ip

# Clone the repository
git clone https://github.com/bobys16/ieltswritingscoring.git
cd ieltswritingscoring
```

### 2. Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker and Docker Compose
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Install Go (for API)
wget https://go.dev/dl/go1.21.4.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.21.4.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc

# Install Node.js (for frontend)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx (reverse proxy)
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 3. Configure Environment Variables
```bash
# Create environment file
cp apps/api/.env.example apps/api/.env

# Edit environment variables
nano apps/api/.env
```

Required environment variables:
```env
PORT=8080
DB_DSN=root:your_password@tcp(db:3306)/ielts?parseTime=true
JWT_SECRET=your-super-secret-jwt-key-here
AI_PROVIDER=openai
AI_KEY=sk-your-openai-api-key-here
RATE_LIMIT_PER_MIN=30
PUBLIC_BASE_URL=https://yourdomain.com
REDIS_URL=redis://redis:6379
```

### 4. Build and Deploy with Docker
```bash
# Build and start all services
docker-compose -f infra/docker-compose.yml up --build -d

# Check services are running
docker-compose -f infra/docker-compose.yml ps
```

### 5. Configure Nginx (Production)
```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/ielts-estimator
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend (React app)
    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API endpoints
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/ielts-estimator /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

## 🔧 Alternative: Manual Build (without Docker)

### Backend (API)
```bash
cd apps/api

# Build Go binary
go mod tidy
go build -o ielts-api .

# Create systemd service
sudo nano /etc/systemd/system/ielts-api.service
```

Service file content:
```ini
[Unit]
Description=IELTS Band Estimator API
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/home/your-user/ieltswritingscoring/apps/api
ExecStart=/home/your-user/ieltswritingscoring/apps/api/ielts-api
Restart=always
Environment=PORT=8080
EnvironmentFile=/home/your-user/ieltswritingscoring/apps/api/.env

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable ielts-api
sudo systemctl start ielts-api
```

### Frontend (React)
```bash
cd apps/web

# Install dependencies and build
npm install
npm run build

# Serve with Nginx
sudo cp -r dist/* /var/www/html/
```

### Database Setup
```bash
# Install MySQL
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Create database
sudo mysql -u root -p
```

SQL commands:
```sql
CREATE DATABASE ielts;
CREATE USER 'ielts_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON ielts.* TO 'ielts_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Redis Setup
```bash
# Install Redis
sudo apt install -y redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
# Set: supervised systemd

sudo systemctl restart redis
sudo systemctl enable redis
```

## 🔍 Monitoring and Logs

### Check Service Status
```bash
# Docker services
docker-compose -f infra/docker-compose.yml logs -f

# Manual services
sudo systemctl status ielts-api
sudo systemctl status nginx
sudo systemctl status mysql
sudo systemctl status redis

# View logs
sudo journalctl -u ielts-api -f
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Health Checks
```bash
# API health
curl http://localhost:8080/health

# Frontend
curl http://localhost:5173

# Full stack through Nginx
curl http://your-domain.com/api/health
```

## 🔒 Security Checklist

- [ ] **Firewall**: Configure UFW to only allow necessary ports
- [ ] **SSL**: Enable HTTPS with Let's Encrypt
- [ ] **Database**: Secure MySQL installation
- [ ] **Environment**: Secure .env file permissions
- [ ] **Updates**: Regular system updates
- [ ] **Backups**: Database backup strategy

### Firewall Setup
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### Secure Environment File
```bash
chmod 600 apps/api/.env
chown your-user:your-user apps/api/.env
```

## 📊 Performance Optimization

### Database Optimization
```sql
-- Add indexes for better performance
ALTER TABLE essays ADD INDEX idx_user_id (user_id);
ALTER TABLE essays ADD INDEX idx_created_at (created_at);
ALTER TABLE essays ADD INDEX idx_public_id (public_id);
```

### Redis Configuration
```bash
# Edit Redis config for better performance
sudo nano /etc/redis/redis.conf

# Recommended settings:
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

## 🚨 Troubleshooting

### Common Issues
1. **Port conflicts**: Check if ports 80, 8080, 3306, 6379 are available
2. **Permission errors**: Ensure correct file permissions
3. **Database connection**: Verify DB credentials and connection
4. **API key issues**: Check OpenAI API key validity
5. **Build failures**: Ensure all dependencies are installed

### Debug Commands
```bash
# Check open ports
sudo netstat -tlnp

# Check Docker containers
docker ps -a
docker logs container-name

# Check system resources
htop
df -h
free -h
```

## 🔄 Updates and Maintenance

### Update Application
```bash
cd ieltswritingscoring
git pull origin main

# Rebuild and restart
docker-compose -f infra/docker-compose.yml down
docker-compose -f infra/docker-compose.yml up --build -d
```

### Database Backups
```bash
# Create backup script
nano backup.sh
```

Backup script:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u ielts_user -p ielts > backup_${DATE}.sql
aws s3 cp backup_${DATE}.sql s3://your-backup-bucket/
rm backup_${DATE}.sql
```

## 📈 Scaling Considerations

For high traffic:
1. **Load Balancer**: Use multiple API instances
2. **Database**: MySQL replication or migration to PostgreSQL
3. **Caching**: Redis cluster setup
4. **CDN**: CloudFlare or AWS CloudFront
5. **Monitoring**: Prometheus + Grafana

---

## 🎯 Quick Start Summary

1. Clone repo on VPS
2. Install Docker & dependencies
3. Configure environment variables
4. Run `docker-compose up --build -d`
5. Configure Nginx
6. Set up SSL certificate
7. Test application

Your IELTS Band Estimator will be live at your domain! 🚀
