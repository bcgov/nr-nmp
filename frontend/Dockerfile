# Base image for the container
FROM node:20.17.0 AS build

# Set environment variables
ENV npm_config_cache=/app/.npm
ENV APP_USER=1011540000

# Create user and group
RUN groupadd --gid ${APP_USER} appGroup && \
  useradd --uid ${APP_USER} --gid appGroup --home /app ${APP_USER}

# Switch to the new user
USER ${APP_USER}

# Set the working directory
WORKDIR /app/

# Copy package.json and package-lock.json first to leverage Docker cache
COPY --chown=${APP_USER} package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY --chown=${APP_USER} . ./

# Ensure TypeScript is installed and compile the project
RUN npm run build

# Expose the port that the app runs on
# EXPOSE 5173

# Run the application in production mode
# CMD ["npm", "run", "serve", "--no-update-notifier", "--max-old-space-size=50"]

FROM caddy:2.8.4-alpine
RUN apk add --no-cache ca-certificates

# Copy static files, verify Caddyfile formatting
COPY --from=build /app/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile
RUN caddy fmt /etc/caddy/Caddyfile

# Boilerplate, not used in OpenShift/Kubernetes
EXPOSE 3000 3001
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:3001/health

# Nonroot user
USER 1001
