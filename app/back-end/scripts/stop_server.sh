#!/bin/bash

# Navigate to the back-end folder
cd /var/www/back-end

# Stop any running Docker containers
echo "Stopping Docker containers..."
sudo usermod -aG docker $USER
newgrp docker
sudo docker stop $(docker ps -q)
sudo docker rm $(docker ps -a -q)
