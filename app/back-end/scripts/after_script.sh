#!/bin/bash

# Navigate to the back-end folder
cd /var/www/back-end

# Stop any running Docker containers
echo "Stopping existing Docker containers..."
sudo docker stop $(sudo docker ps -q)

# Remove dangling Docker images (optional cleanup)
echo "Cleaning up old Docker images..."
sudo docker image prune -f
