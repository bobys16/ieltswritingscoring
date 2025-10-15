# 🚀 VPS Deployment Checklist

## ✅ Pre-Deployment (Completed)
- [x] ✅ API compiled (29MB Linux binary ready)
- [x] ✅ Frontend built (608KB static files ready)
- [x] ✅ All tests passing
- [x] ✅ Docker configuration ready
- [x] ✅ Deployment scripts prepared

## 📋 VPS Setup Commands

### Quick Deploy (Recommended)
```bash
# 1. Copy deployment script to your VPS
scp deploy.sh user@your-vps-ip:~/

# 2. SSH into VPS and run
ssh user@your-vps-ip
chmod +x deploy.sh
./deploy.sh
```

### Manual Deploy Steps
```bash
# 1. Install dependencies
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose nginx

# 2. Clone repository
git clone https://github.com/bobys16/ieltswritingscoring.git
cd ieltswritingscoring

# 3. Configure environment
cp apps/api/.env.example apps/api/.env
nano apps/api/.env  # Add your OpenAI API key and other settings

# 4. Start with Docker
docker-compose -f infra/docker-compose.yml up -d

# 5. Configure Nginx (optional - for custom domain)
# Follow DEPLOYMENT_GUIDE.md for detailed steps
```

## 🔑 Required Environment Variables

Edit `apps/api/.env` with these values:
```env
# REQUIRED - Get from OpenAI
AI_KEY=sk-your-openai-api-key-here

# REQUIRED - Generate random secure string
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# REQUIRED - Your domain (or VPS IP)
PUBLIC_BASE_URL=https://yourdomain.com

# Database (auto-configured for Docker)
DB_DSN=postgres://ielts_user:ielts_password@db:5432/ielts_db?sslmode=disable

# API settings
PORT=8080
RATE_LIMIT_PER_MIN=30
REDIS_URL=redis://redis:6379
```

## 🌐 Domain Setup (Optional)

### If you have a domain:
1. Point DNS A record to your VPS IP
2. Configure Nginx with your domain
3. Get SSL certificate: `sudo certbot --nginx -d yourdomain.com`

### If using IP only:
- Access via: `http://your-vps-ip`
- API health: `http://your-vps-ip/api/health`

## 🔍 Health Checks

After deployment, test these URLs:
```bash
# API health check
curl http://your-server/api/health
# Should return: {"ok":true}

# Frontend
curl http://your-server
# Should return HTML

# Test essay analysis (requires API key)
curl -X POST http://your-server/api/essays/analyze \
  -H "Content-Type: application/json" \
  -d '{"text":"This is a test essay...","taskType":"task2"}'
```

## 📊 Monitoring Commands

```bash
# Check Docker services
docker-compose -f infra/docker-compose.yml ps
docker-compose -f infra/docker-compose.yml logs -f

# Check system resources
htop
df -h
free -h

# Check open ports
sudo netstat -tlnp | grep -E ":(80|443|8080|5432|6379)"
```

## 🔧 Troubleshooting

### Common Issues:
1. **Port conflicts**: Kill processes using ports 80, 8080, 5432, 6379
2. **Permission denied**: Run `sudo usermod -aG docker $USER` then logout/login
3. **API key error**: Verify OpenAI API key in .env file
4. **Database connection**: Check PostgreSQL container is running

### Debug Commands:
```bash
# Check specific container logs
docker logs ieltswritingscoring_api_1
docker logs ieltswritingscoring_web_1
docker logs ieltswritingscoring_db_1

# Restart specific service
docker-compose -f infra/docker-compose.yml restart api

# Rebuild and restart
docker-compose -f infra/docker-compose.yml down
docker-compose -f infra/docker-compose.yml up --build -d
```

## 📈 Performance Optimization

### For production use:
1. **Enable caching**: Configure Redis properly
2. **Set up CDN**: CloudFlare or similar
3. **Database optimization**: PostgreSQL tuning
4. **Monitoring**: Set up logs and metrics
5. **Backups**: Regular database backups

## 🔒 Security Checklist

- [ ] Change default database passwords
- [ ] Set strong JWT_SECRET
- [ ] Configure firewall (only allow 22, 80, 443)
- [ ] Enable SSL certificate
- [ ] Regular security updates
- [ ] Monitor API usage and rate limits

## 🎯 Success Criteria

Your deployment is successful when:
- ✅ All Docker containers are running
- ✅ Health check returns OK
- ✅ Frontend loads in browser
- ✅ API accepts essay analysis requests
- ✅ Database stores results
- ✅ SSL certificate works (if domain configured)

---

## 📞 Quick Support

If you encounter issues:
1. Check the logs: `docker-compose logs -f`
2. Verify environment variables in `.env`
3. Test individual components
4. Check firewall settings
5. Verify OpenAI API key is valid

🚀 **Your IELTS Band Estimator is ready for production!**
