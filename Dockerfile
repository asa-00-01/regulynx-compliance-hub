
# Stage 1: Build the React application
FROM oven/bun:1 as builder

WORKDIR /app

# Accept build arguments for environment variables.
# All VITE_ variables from environment.ts should be declared here to be configurable at build time.
ARG VITE_APP_NAME
ARG VITE_APP_DOMAIN
ARG VITE_SUPPORT_EMAIL
ARG VITE_API_BASE_URL
ARG VITE_ENVIRONMENT=production
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_USE_MOCK_DATA=false

# Set environment variables for the build process
ENV VITE_APP_NAME=${VITE_APP_NAME}
ENV VITE_APP_DOMAIN=${VITE_APP_DOMAIN}
ENV VITE_SUPPORT_EMAIL=${VITE_SUPPORT_EMAIL}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_ENVIRONMENT=${VITE_ENVIRONMENT}
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
ENV VITE_USE_MOCK_DATA=${VITE_USE_MOCK_DATA}

# Copy package management files
COPY package.json bun.lockb tsconfig.json ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application source code
# Note: .dockerignore is used to exclude unnecessary files
COPY . .

# Build the application
RUN bun run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
