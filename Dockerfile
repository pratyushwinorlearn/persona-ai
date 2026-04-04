FROM node:20-slim

# We added wget and unzip here so we can download Rhubarb
RUN apt-get update && apt-get install -y openssl ffmpeg wget unzip && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Download and extract the Linux version of Rhubarb Lip Sync
RUN wget https://github.com/DanielSWolf/rhubarb-lip-sync/releases/download/v1.13.0/Rhubarb-Lip-Sync-1.13.0-Linux.zip \
    && unzip Rhubarb-Lip-Sync-1.13.0-Linux.zip \
    && mv Rhubarb-Lip-Sync-1.13.0-Linux /app/rhubarb_linux \
    && rm Rhubarb-Lip-Sync-1.13.0-Linux.zip

COPY backend/package*.json ./
RUN npm install

COPY backend/ .

RUN npx prisma generate

EXPOSE 8000

CMD ["node", "src/index.js"]