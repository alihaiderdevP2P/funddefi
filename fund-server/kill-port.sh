#!/bin/bash

# Script to kill process on port 3001

PORT=3001

echo "Checking for processes on port $PORT..."

# Try to find and kill process on port 3001
if lsof -ti:$PORT > /dev/null 2>&1; then
  echo "Found process on port $PORT. Killing..."
  lsof -ti:$PORT | xargs kill -9
  sleep 1
  echo "Port $PORT is now free."
else
  echo "No process found on port $PORT."
fi

