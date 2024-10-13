FROM node:20.2.0-slim

WORKDIR /app

COPY . .

# Install required packages, including CA certificates
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    gnupg \
    ca-certificates \
    --no-install-recommends

# Add the Google Chrome signing key and install Chrome
RUN curl -sSL https://dl.google.com/linux/linux_signing_key.pub -o /etc/apt/trusted.gpg.d/google-linux-keyring.gpg && \
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list && \
    apt-get update && \
    apt-get install -y google-chrome-stable --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*


RUN npm install

ENV NODE_ENV=production
EXPOSE 8000

CMD ["node", "index.js"]