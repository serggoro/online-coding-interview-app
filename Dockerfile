# Multi-stage Dockerfile for Online Coding Interview App
# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/client

# Copy frontend package files
COPY client/package*.json ./

# Install frontend dependencies (including dev deps for build)
RUN npm ci --legacy-peer-deps

# Copy frontend source
COPY client/ ./

# Build frontend for production
RUN npm run build

# Stage 2: Build backend
FROM node:18-alpine AS backend-builder

WORKDIR /app/server

# Copy backend package files
COPY server/package*.json ./

# Install backend dependencies (including dev deps for build)
RUN npm ci --legacy-peer-deps

# Copy backend source
COPY server/ ./

# Build backend TypeScript
RUN npm run build

# Stage 3: Production image
FROM node:18-alpine AS production

WORKDIR /app

# Copy backend package files and install production dependencies only
COPY server/package*.json ./
RUN npm ci --only=production --legacy-peer-deps

# Copy built backend from builder stage
COPY --from=backend-builder /app/server/dist ./dist

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/client/dist ./public

# Expose the port
EXPOSE 3000

# Set NODE_ENV to production
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/index.js"]
