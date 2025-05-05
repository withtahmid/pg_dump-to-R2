FROM node:18-alpine AS builder

# Install PostgreSQL client and pnpm
RUN apk add --no-cache postgresql-client
RUN corepack enable && corepack prepare pnpm@8.9.0 --activate

# Create app directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Build the TypeScript code
RUN pnpm build

# Production stage
FROM node:18-alpine

# Install PostgreSQL client and pnpm
RUN apk add --no-cache postgresql-client
RUN corepack enable && corepack prepare pnpm@8.9.0 --activate

# Create app directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install production dependencies only
RUN pnpm install --prod

# Copy built JavaScript files from builder stage
COPY --from=builder /app/dist ./dist

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/index.js"]