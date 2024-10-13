# Use the official Node.js slim image
FROM node:20.2.0-slim

# Set the working directory
WORKDIR /app

# Copy all the project files to the container
COPY . .

# Install dependencies
RUN npm install

# Install additional dependencies required for Google Chrome
RUN apt-get update && apt-get install -y \
    wget \
    sudo \
    gnupg \
    --no-install-recommends

# Download and install Google Chrome
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && \
    apt-get install -y ./google-chrome-stable_current_amd64.deb && \
    rm google-chrome-stable_current_amd64.deb

# Set environment variables
ENV NODE_ENV=production

# Expose the application port
EXPOSE 8000

# Set the default command to run the app
CMD ["node", "index.js"]
