# Base image for the container
FROM node:20.17.0

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
EXPOSE 5173

# Run the application in production mode
CMD ["npm", "run", "serve", "--no-update-notifier", "--max-old-space-size=50"]
