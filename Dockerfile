FROM node:20-slim

# WE ADDED FFMPEG RIGHT HERE:
RUN apt-get update && apt-get install -y openssl ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY backend/ .

RUN npx prisma generate

EXPOSE 8000

CMD ["node", "src/index.js"]