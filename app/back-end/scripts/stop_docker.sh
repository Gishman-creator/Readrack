#!/bin/bash

# Navigate to the back-end folder
cd /home/ubuntu/back-end

# Stop any running Docker containers
echo "Stopping Docker containers..."
sudo docker-compose down
