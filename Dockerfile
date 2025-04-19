FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install dependencies with clean slate
RUN npm ci --silent

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Production environment
FROM node:18-alpine AS production

# Install serve for serving static content
RUN npm install -g serve

# Set working directory
WORKDIR /app

# Copy built assets from build stage
COPY --from=build /app/build ./build

# Set environment variables
ENV NODE_ENV production

# Expose port
EXPOSE 3000

# Start the application
CMD ["serve", "-s", "build", "-l", "3000"] 