FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY backend/ .

RUN npx prisma generate

EXPOSE 8000

CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]