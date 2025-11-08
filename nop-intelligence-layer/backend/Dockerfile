FROM node:20-alpine

WORKDIR /app

# Optimize install
COPY package.json package-lock.json* ./
RUN npm ci || npm i

# Copy source
COPY tsconfig.json ./
COPY src ./src

EXPOSE 5000

CMD ["npm", "run", "dev"]

