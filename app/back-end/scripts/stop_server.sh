#!/bin/bash

# Navigate to the back-end folder
cd /var/www/back-end

# Stop any running Docker containers
echo "Stopping Docker containers..."
sudo docker ps -q | ForEach-Object { docker stop $_ }
sudo docker rm $(docker ps -a -q)
