# 🐳 Docker Setup for FundFlow Platform

Run the entire FundFlow platform (Frontend + Backend + Database) with a single command!

## 🚀 Quick Start

### Using the Helper Script (Recommended)

```bash
# Production mode (optimized build)
./docker-start.sh

# Development mode (hot-reload)
./docker-start.sh dev

# Stop all services
./docker-stop.sh
```

### Using Docker Compose Directly

```bash
# Production
docker-compose up -d

# Development
docker-compose -f docker-compose.dev.yml up -d

# Stop
docker-compose down
```

## 📦 What Gets Dockerized

- **PostgreSQL Database** - Port 5433
- **NestJS Backend** - Port 3001
- **Next.js Frontend** - Port 3000

## 🌐 Access URLs

After starting the services:

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **API Documentation**: http://localhost:3001/api-docs (if Swagger is enabled)
- **Database**: localhost:5433 (postgres/password)

## 📋 Files Created

1. **Dockerfile** - Frontend Docker build configuration
2. **docker-compose.yml** - Production orchestration
3. **docker-compose.dev.yml** - Development with hot-reload
4. **docker-start.sh** - Easy start script
5. **docker-stop.sh** - Easy stop script
6. **.dockerignore** - Files to exclude from Docker build

## 🔧 Configuration

### Environment Variables

The frontend needs these environment variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=ws://localhost:3001
GEMINI_API_KEY=your-api-key-here
```

### next.config.mjs

Updated with `output: 'standalone'` for optimized Docker builds.

## 🎯 Production vs Development

### Production Mode (`docker-compose.yml`)

- ✅ Optimized Next.js build
- ✅ Smaller image size
- ✅ Better performance
- ✅ Production-ready
- ❌ No hot-reload
- ❌ Longer build time

### Development Mode (`docker-compose.dev.yml`)

- ✅ Hot-reload on file changes
- ✅ Fast iteration
- ✅ Debug-friendly
- ❌ Larger image size
- ❌ Not for production

## 📊 Service Health Checks

The `postgres` service includes health checks. The backend waits for the database to be ready before starting.

## 🔄 Common Commands

```bash
# View running containers
docker-compose ps

# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f frontend

# Restart a service
docker-compose restart frontend

# Rebuild a specific service
docker-compose up -d --build frontend

# Access a container shell
docker exec -it crowdfunding-frontend sh
docker exec -it crowdfunding-backend sh

# Access PostgreSQL
docker exec -it crowdfunding-postgres psql -U postgres -d crowdfunding
```

## 🗄️ Database Management

```bash
# View database data
docker exec -it crowdfunding-postgres psql -U postgres -d crowdfunding -c "SELECT * FROM campaigns;"

# Run seed script
docker exec -i crowdfunding-postgres psql -U postgres -d crowdfunding < backend/database/seed.sql

# Backup database
docker exec crowdfunding-postgres pg_dump -U postgres crowdfunding > backup.sql

# Restore database
docker exec -i crowdfunding-postgres psql -U postgres -d crowdfunding < backup.sql
```

## 🧹 Cleanup

```bash
# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (WARNING: deletes database)
docker-compose down -v

# Remove all unused Docker resources
docker system prune -a
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Kill process using port 3001
lsof -ti:3001 | xargs kill -9
```

### Frontend Build Fails

```bash
# Rebuild without cache
docker-compose build --no-cache frontend

# Check for syntax errors
docker-compose logs frontend
```

### Database Won't Connect

```bash
# Check if PostgreSQL is healthy
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Services Keep Restarting

```bash
# Check logs for errors
docker-compose logs -f

# Check resource usage
docker stats
```

## 📈 Resource Usage

Typical resource usage:

- **Frontend**: ~200MB RAM
- **Backend**: ~150MB RAM
- **PostgreSQL**: ~50MB RAM
- **Total**: ~400MB RAM

## 🔐 Security Notes

For production deployment:

1. Change default passwords in `docker-compose.yml`
2. Use environment variables for secrets
3. Enable SSL/TLS
4. Configure firewall rules
5. Use Docker secrets for sensitive data

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- Full setup guide: `DOCKER_SETUP.md`

## 🎉 Success!

Once all services are running:

1. Visit http://localhost:3000
2. Connect your wallet
3. Start exploring campaigns!

For detailed setup information, see `DOCKER_SETUP.md`.
