# IELTS Band Estimator - Deployment Runbook

## Overview

This runbook provides step-by-step instructions for deploying and managing the IELTS Band Estimator application in production environments.

## 🚀 Production Deployment

### Prerequisites

- Docker and Docker Compose installed
- Domain name configured
- SSL certificate (recommended: Let's Encrypt)
- OpenAI API key
- Minimum server specs: 2GB RAM, 1 CPU, 20GB storage

### Step 1: Server Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create application directory
sudo mkdir -p /opt/ielts-estimator
sudo chown $USER:$USER /opt/ielts-estimator
cd /opt/ielts-estimator
```

### Step 2: Clone and Configure

```bash
# Clone repository
git clone https://github.com/yourusername/ielts-band-estimator.git .

# Copy environment configuration
cp infra/.env.example infra/.env
```

### Step 3: Environment Configuration

Edit `infra/.env` with production values:

```env
# Database (use strong passwords)
DB_DSN=postgres://ielts_user:STRONG_PASSWORD@db:5432/ielts_db?sslmode=disable
POSTGRES_PASSWORD=STRONG_PASSWORD

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your_generated_secret_here

# OpenAI Configuration
AI_PROVIDER=openai
AI_KEY=sk-your_openai_key_here

# Application
PUBLIC_BASE_URL=https://yourdomain.com
PORT=8080

# Rate Limiting
RATE_LIMIT_PER_MIN=30

# Redis
REDIS_URL=redis://redis:6379
```

### Step 4: SSL Configuration (Optional but Recommended)

If using SSL, update `infra/nginx.conf`:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;
    
    # ... rest of configuration
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### Step 5: Deploy

```bash
# Deploy the application
make up

# Or manually:
cd infra && ./deploy.sh
```

### Step 6: Verify Deployment

```bash
# Check all services are running
docker-compose ps

# Check logs
docker-compose logs -f

# Test endpoints
curl https://yourdomain.com/health
curl https://yourdomain.com/api/health
```

## 🔧 Configuration Management

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DB_DSN` | PostgreSQL connection string | Yes | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `AI_KEY` | OpenAI API key | Yes | - |
| `AI_PROVIDER` | AI provider (openai) | No | openai |
| `RATE_LIMIT_PER_MIN` | Rate limit per minute | No | 30 |
| `PUBLIC_BASE_URL` | Public URL of the app | No | http://localhost |
| `REDIS_URL` | Redis connection URL | No | redis://localhost:6379 |

### Database Migration

```bash
# Run migrations manually if needed
docker-compose exec api ./main migrate

# Check database status
docker-compose exec db psql -U ielts_user -d ielts_db -c "\dt"
```

## 📊 Monitoring and Health Checks

### Health Endpoints

- **Application**: `GET /health`
- **API**: `GET /api/health`
- **Database**: Check via API health endpoint
- **Redis**: Check via API health endpoint

### Key Metrics to Monitor

1. **Response Times**
   - API endpoints: < 1s average
   - Essay analysis: < 10s average
   - PDF generation: < 3s average

2. **Error Rates**
   - 4xx errors: < 5%
   - 5xx errors: < 1%

3. **Resource Usage**
   - Memory: < 80%
   - CPU: < 70%
   - Disk: < 80%

4. **Database**
   - Connection pool usage
   - Query performance
   - Table sizes

### Log Management

```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api
docker-compose logs -f db

# Log rotation (add to crontab)
0 0 * * * docker-compose logs --no-color --tail=1000 > /var/log/ielts-estimator.log && docker-compose logs --tail=0 -f > /dev/null
```

## 🚨 Backup Procedures

### Database Backup

```bash
# Create backup script: /opt/scripts/backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups"
mkdir -p $BACKUP_DIR

# Database backup
docker-compose exec -T db pg_dump -U ielts_user ielts_db | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: db_backup_$DATE.sql.gz"
```

```bash
# Make executable and add to crontab
chmod +x /opt/scripts/backup.sh
# Add to crontab: 0 2 * * * /opt/scripts/backup.sh
```

### Configuration Backup

```bash
# Backup configuration
tar -czf config_backup_$(date +%Y%m%d).tar.gz infra/.env infra/nginx.conf infra/docker-compose.yml
```

## 🔄 Updates and Maintenance

### Application Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Verify deployment
docker-compose ps
curl https://yourdomain.com/health
```

### Zero-Downtime Updates

```bash
# For zero-downtime updates (requires load balancer)
docker-compose up -d --scale api=2
# Test new instance
docker-compose up -d --scale api=1 --no-recreate
```

### Dependency Updates

```bash
# Update Go dependencies
cd apps/api
go get -u ./...
go mod tidy

# Update Node.js dependencies
cd apps/web
npm update
npm audit fix
```

## 🔒 Security Maintenance

### SSL Certificate Renewal

```bash
# If using Let's Encrypt with certbot
certbot renew --dry-run
```

### Security Checks

```bash
# Check for security vulnerabilities
cd apps/api && go list -json -m all | nancy sleuth
cd apps/web && npm audit

# Update base images
docker-compose build --no-cache --pull
```

## 🚨 Troubleshooting

### Common Issues

#### Service Won't Start

```bash
# Check logs
docker-compose logs service_name

# Check resource usage
docker stats

# Restart specific service
docker-compose restart service_name
```

#### Database Connection Issues

```bash
# Check database status
docker-compose exec db pg_isready -U ielts_user

# Check connection from API
docker-compose exec api ping db

# Reset database connection
docker-compose restart db api
```

#### High Memory Usage

```bash
# Check memory usage by service
docker stats --no-stream

# Restart services if needed
docker-compose restart

# Clear Redis cache if needed
docker-compose exec redis redis-cli FLUSHALL
```

#### Rate Limiting Issues

```bash
# Check Redis status
docker-compose exec redis redis-cli ping

# Check rate limit keys
docker-compose exec redis redis-cli keys "rate_limit:*"

# Clear rate limits if needed
docker-compose exec redis redis-cli del "rate_limit:*"
```

### Emergency Procedures

#### Complete Service Restart

```bash
# Stop all services
docker-compose down

# Clean up if needed
docker system prune -f

# Start services
docker-compose up -d

# Verify all services
docker-compose ps
```

#### Database Recovery

```bash
# Stop application
docker-compose stop api

# Restore from backup
gunzip -c /opt/backups/db_backup_YYYYMMDD_HHMMSS.sql.gz | docker-compose exec -T db psql -U ielts_user ielts_db

# Restart application
docker-compose start api
```

## 📞 Support Contacts

- **Technical Issues**: tech@yourcompany.com
- **Infrastructure**: infra@yourcompany.com
- **Emergency**: +1-XXX-XXX-XXXX

## 📋 Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database backups scheduled
- [ ] Monitoring configured
- [ ] DNS records configured

### Post-Deployment
- [ ] Health checks passing
- [ ] Performance metrics within targets
- [ ] Error rates acceptable
- [ ] Backups working
- [ ] Logs being collected

### Weekly Maintenance
- [ ] Check backup integrity
- [ ] Review error logs
- [ ] Monitor resource usage
- [ ] Update dependencies (if needed)
- [ ] Security audit
