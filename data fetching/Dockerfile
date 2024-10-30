FROM node:20.3.0-slim

WORKDIR /app

COPY . .

RUN npm install

ENV NODE_ENV=production
EXPOSE 8000

CMD ["node", "index.js"]