#!/bin/bash

# Set error handling
set -e

echo "========================================="
echo "Starting ColorPuzzle application"
echo "========================================="

# Check if Docker is installed and running
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed or not in PATH"
    exit 1
fi

# Check if containers are already running
if docker ps | grep -q "colorpuzzle-"; then
    echo "Some ColorPuzzle containers are already running. Please run './end-app.sh' first."
    exit 1
fi

# Start MongoDB container
echo "Starting MongoDB container..."
if docker run -d \
  --name colorpuzzle-mongodb \
  --network colorpuzzle-network \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  --restart always \
  mongo:6.0; then
    echo "MongoDB container started successfully"
else
    echo "Error: Failed to start MongoDB container"
    exit 1
fi

# Wait for MongoDB to initialize
echo "Waiting for MongoDB to initialize..."
sleep 5

# Start Backend container
echo "Starting Backend container..."
if docker run -d \
  --name colorpuzzle-backend \
  --network colorpuzzle-network \
  -p 5000:5000 \
  -e MONGODB_URI=mongodb://colorpuzzle-mongodb:27017/colorpuzzle \
  --restart always \
  colorpuzzle-backend; then
    echo "Backend container started successfully"
else
    echo "Error: Failed to start Backend container"
    docker stop colorpuzzle-mongodb
    docker rm colorpuzzle-mongodb
    exit 1
fi

# Wait for Backend to initialize
echo "Waiting for Backend to initialize..."
sleep 3

# Start Frontend container
echo "Starting Frontend container..."
if docker run -d \
  --name colorpuzzle-frontend \
  --network colorpuzzle-network \
  -p 3000:80 \
  -e REACT_APP_API_URL=http://localhost:5000 \
  --restart always \
  colorpuzzle-frontend; then
    echo "Frontend container started successfully"
else
    echo "Error: Failed to start Frontend container"
    docker stop colorpuzzle-backend colorpuzzle-mongodb
    docker rm colorpuzzle-backend colorpuzzle-mongodb
    exit 1
fi

echo "========================================="
echo "ColorPuzzle application started successfully!"
echo "Open your browser and navigate to http://localhost:3000 to play the game"
echo "========================================="

# Check the status of all containers
echo "Checking container status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep colorpuzzle