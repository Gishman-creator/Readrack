#!/bin/bash

# Navigate to the back-end folder
cd /readrack/back-end

# Build and start the Docker container in detached mode
echo "Building and starting Docker containers..."
sudo docker-compose up -d --build
