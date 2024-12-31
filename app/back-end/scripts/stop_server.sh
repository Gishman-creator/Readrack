#!/bin/bash

# Navigate to the back-end folder
cd /var/www/back-end

# Stop any running Docker containers
echo "Stopping Docker containers..."
sudo docker stop $(sudo docker ps -q)
