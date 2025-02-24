# Build stage
FROM node:18.19.0-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build the web version with the correct public URL
RUN PUBLIC_URL=/compass npm run build:web

# Production stage
FROM nginx:alpine

# Copy built static files from builder stage to the compass subdirectory
COPY --from=builder /app/dist /usr/share/nginx/html/compass

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]