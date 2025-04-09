# Stage 1: Build with Bun
FROM oven/bun:1 AS build

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./ 

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the app
COPY . .

# Build the Svelte app with Vite
RUN bun run build

# Stage 2: Serve with Nginx
FROM nginx:1.19-alpine AS serve

# Remove default static files
RUN rm -rf /usr/share/nginx/html/*

# Copy the built static files from Vite's dist/ folder
COPY --from=build /app/dist /usr/share/nginx/html

# Update the Nginx configuration to listen on port 5000
RUN sed -i 's/listen       80;/listen       5000;/' /etc/nginx/conf.d/default.conf

# Expose port 5000
EXPOSE 5000

# Start Nginx server (not the start script!)
CMD ["nginx", "-g", "daemon off;"]
