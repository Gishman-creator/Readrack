FROM node:20.2.0-slim

WORKDIR /app

COPY . .

# Add this to your Dockerfile
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    gnupg \
    --no-install-recommends

# Install Chrome (headless mode)
RUN curl -sSL https://dl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list && \
    apt-get update && \
    apt-get install -y google-chrome-stable --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Install missing shared libraries (required by Puppeteer)
RUN apt-get install -y \
    fonts-liberation \
    libappindicator3-1 \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libxcomposite1 \
    libxrandr2 \
    libxss1 \
    libgconf-2-4 \
    libxdamage1 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libgtk-3-0 \
    libcurl4 \
    ca-certificates \
    --no-install-recommends

RUN npm install

ENV NODE_ENV=production
EXPOSE 8000

CMD ["node", "index.js"]