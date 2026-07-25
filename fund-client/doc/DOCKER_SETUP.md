# Docker Setup Guide

This guide will help you run the entire FundFlow platform using Docker.

## Prerequisites

- Docker Desktop installed (Docker Engine + Docker Compose)
- 4GB+ RAM available for Docker
- Ports 3000, 3001, and 5433 available

## Environment Variables

Create a `.env` file in the root directory:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# WebSocket URL
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Gemini API Key (for AI features)
GEMINI_API_KEY=your-gemini-api-key-here

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=crowdfunding

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Node Environment
NODE_ENV=production
```

## Quick Start

### Production Mode (Optimized Build)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

The application will be available at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **PostgreSQL**: localhost:5433

### Development Mode (Hot-Reload)

```bash
# Start all services in development mode
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop all services
docker-compose -f docker-compose.dev.yml down
```

## Individual Service Management

### Build Services

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build frontend
docker-compose build backend
```

### Start/Stop Services

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d frontend

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes database data)
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f postgres
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart frontend
```

## Accessing Containers

```bash
# Access frontend container
docker exec -it crowdfunding-frontend sh

# Access backend container
docker exec -it crowdfunding-backend sh

# Access PostgreSQL
docker exec -it crowdfunding-postgres psql -U postgres -d crowdfunding
```

## Database Management

### Reset Database

```bash
# Stop all services
docker-compose down

# Remove database volume
docker volume rm crowdfunding-platform-backend_postgres_data

# Start services (will reinitialize database)
docker-compose up -d
```

### Run Migrations

```bash
# Access backend container
docker exec -it crowdfunding-backend sh

# Run migrations
npm run migration:run
```

## Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# Check what's using the port
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
lsof -ti:5433 | xargs kill -9
```

### Container Won't Start

```bash
# Check container status
docker-compose ps

# Check container logs
docker-compose logs frontend
docker-compose logs backend

# Rebuild without cache
docker-compose build --no-cache

# Remove all containers and start fresh
docker-compose down -v
docker-compose up -d --build
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Test connection
docker exec -it crowdfunding-postgres psql -U postgres -d crowdfunding -c "SELECT version();"
```

## Performance Optimization

### Production Build

For optimal performance in production:

1. Set `NODE_ENV=production`
2. Use `docker-compose.yml` (not dev version)
3. Frontend will be pre-built and optimized
4. Backend runs in production mode

### Resource Limits

Add resource limits in docker-compose.yml:

```yaml
services:
  frontend:
    deploy:
      resources:
        limits:
          cpus: "1"
          memory: 1G
        reservations:
          cpus: "0.5"
          memory: 512M
```

## Updating the Application

```bash
# Pull latest changes
git pull

# Rebuild and restart services
docker-compose down
docker-compose up -d --build
```

## Clean Up

```bash
# Remove all containers, networks, and volumes
docker-compose down -v

# Remove all unused Docker resources
docker system prune -a
```

## Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ http://localhost:3000
       │
┌──────▼──────────┐
│   Frontend      │ (Next.js)
│   Port: 3000    │
└──────┬──────────┘
       │
       │ API calls to backend
       │
┌──────▼──────────┐
│   Backend       │ (NestJS)
│   Port: 3001    │
└──────┬──────────┘
       │
       │ Database queries
       │
┌──────▼──────────┐
│   PostgreSQL    │
│   Port: 5433    │
└─────────────────┘
```

## Network Details

All services run on the `crowdfunding-network` Docker network:

- Services can communicate using container names (e.g., `backend`, `postgres`)
- Frontend calls backend at `http://backend:3001/api` internally
- External access via localhost ports

## Next Steps

1. Copy this guide and adjust environment variables
2. Run `docker-compose up -d`
3. Access the application at http://localhost:3000
4. Check logs if any issues: `docker-compose logs -f`

For more details, see the main README.md file.
