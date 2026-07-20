FROM node:20-alpine
RUN apk add --no-cache poppler-utils
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/main.js"]