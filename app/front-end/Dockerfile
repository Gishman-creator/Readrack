# Use the official Node.js slim image as a base image
FROM node:20.3.0-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code to the container
COPY . .

# Build the Vite application
RUN npm run build

# Install a lightweight static file server to serve the build files
RUN npm install -g serve

# Use the port provided by Cloud Run (default: 8080)
ENV PORT 8080

# Expose the port the app will run on
EXPOSE 8080

# Command to serve the app, dynamically using the PORT environment variable
CMD ["serve", "-s", "dist", "-l", "8080"]
