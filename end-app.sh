#!/bin/bash

# Set error handling
set -e

echo "========================================="
echo "Stopping ColorPuzzle application"
echo "========================================="

# Check if Docker is installed and running
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed or not in PATH"
    exit 1
fi

# Stop and remove containers
echo "Stopping containers..."

# Function to stop and remove a container if it exists
stop_container() {
    if docker ps -a | grep -q "$1"; then
        echo "Stopping $1..."
        docker stop "$1" || echo "Warning: Failed to stop $1"
        echo "Removing $1..."
        docker rm "$1" || echo "Warning: Failed to remove $1"
    else
        echo "$1 is not running, skipping"
    fi
}

# Stop containers in reverse order
stop_container "colorpuzzle-frontend"
stop_container "colorpuzzle-backend"
stop_container "colorpuzzle-mongodb"

echo "========================================="
echo "ColorPuzzle application stopped successfully!"
echo "========================================="

# Option to clean up completely (uncomment if needed)
# echo "Do you want to remove the Docker network and volume? (y/N)"
# read -r response
# if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
#     echo "Removing Docker network..."
#     docker network rm colorpuzzle-network || echo "Warning: Failed to remove network"
#     echo "Removing MongoDB volume..."
#     docker volume rm mongodb_data || echo "Warning: Failed to remove volume"
#     echo "Clean up completed!"
# fi