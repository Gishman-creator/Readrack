#!/bin/bash

# Navigate to the back-end folder
cd /readrack/back-end

# Ensure correct permissions for the folder
echo "Setting folder permissions..."
sudo chmod -R 755 /home/ubuntu/back-end

# Install dependencies (if needed for local setup)
if [ -f package.json ]; then
    echo "Installing dependencies..."
fi

# Verify Docker is installed
if ! [ -x "$(command -v docker)" ]; then
    echo "Error: Docker is not installed." >&2
    exit 1
fi
