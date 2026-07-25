#!/bin/bash

# FundFlow Platform - Docker Stop Script
# This script stops all Docker services

echo "🛑 Stopping FundFlow Platform..."

# Stop all services
docker-compose down

echo ""
echo "✅ All services stopped!"
echo ""
echo "💡 To remove all data (including database):"
echo "   docker-compose down -v"
echo ""
echo "💡 To restart services:"
echo "   ./docker-start.sh"

