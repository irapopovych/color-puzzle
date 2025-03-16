#!/bin/bash

# Set error handling
set -e

echo "========================================="
echo "Starting ColorPuzzle application preparation"
echo "========================================="

# Check if Docker is installed and running
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed or not in PATH"
    exit 1
fi

# Create Docker network if it doesn't exist
echo "Creating Docker network: colorpuzzle-network"
if ! docker network inspect colorpuzzle-network &> /dev/null; then
    docker network create colorpuzzle-network
    echo "Network created successfully"
else
    echo "Network already exists, skipping creation"
fi

# Build frontend image
echo "Building frontend image..."
cd frontend
if docker build -t colorpuzzle-frontend .; then
    echo "Frontend image built successfully"
else
    echo "Error: Failed to build frontend image"
    exit 1
fi
cd ..

# Build backend image
echo "Building backend image..."
cd backend
if docker build -t colorpuzzle-backend .; then
    echo "Backend image built successfully"
else
    echo "Error: Failed to build backend image"
    exit 1
fi
cd ..

# Create MongoDB volume if it doesn't exist
echo "Creating MongoDB volume: mongodb_data"
if ! docker volume inspect mongodb_data &> /dev/null; then
    docker volume create mongodb_data
    echo "Volume created successfully"
else
    echo "Volume already exists, skipping creation"
fi

echo "========================================="
echo "Preparation completed successfully!"
echo "Run './start-app.sh' to start the application"
echo "========================================="