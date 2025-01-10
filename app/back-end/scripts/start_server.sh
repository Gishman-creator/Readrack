#!/bin/bash

# Navigate to the back-end folder
cd /var/www/back-end

# Build and start the Docker container in detached mode
echo "Building and starting Docker containers..."
sudo docker stop $(docker ps -q)
sudo docker rm $(docker ps -a -q)
sudo docker build -t my-api .           
sudo docker run -d --name my-api-container -p 8000:8000 my-api
