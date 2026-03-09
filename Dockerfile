# 1. Build Stage
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run gcp-build

# 2. Execution Stage
FROM node:20-slim
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
# If you have a 'public' or 'assets' folder needed at runtime, copy it here:
# COPY --from=builder /app/public ./public 

EXPOSE 8080
ENV NODE_ENV=production
CMD ["npm", "start"]
