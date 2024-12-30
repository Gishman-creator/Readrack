#!/bin/bash

# Navigate to the back-end folder
cd /app/back-end  || { echo "Failed to navigate to backend directory"; exit 1; }

# Start the server using pm2
echo "Starting the Node.js server using pm2..."
pm2 start npm --name "nodeapp-backend" -- start

# Save the pm2 process list
echo "Saving the pm2 process list..."
pm2 save

echo "Node.js server started successfully."
