#!/bin/bash

# Navigate to the back-end folder
cd /home/ubuntu/back-end

# Stop any running Docker containers
echo "Stopping existing Docker containers..."
sudo docker-compose down

# Remove dangling Docker images (optional cleanup)
echo "Cleaning up old Docker images..."
sudo docker image prune -f
