FROM node:20.3.0-slim

WORKDIR /app

COPY . .

RUN npm config set registry https://registry.npmjs.org
RUN apt-get update && apt-get install -y ca-certificates
RUN npm install --timeout=600000

ENV NODE_ENV=production
EXPOSE 8000

CMD ["node", "index.js"]