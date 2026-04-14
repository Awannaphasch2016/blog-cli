FROM ubuntu:22.04

# Install system dependencies
RUN apt-get update && \
    apt-get install -y nodejs npm git curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install OpenCLI globally
RUN npm install -g @jackwener/opencli

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy application source
COPY . .

# Install blog-cli globally so it's available as 'blog' command
RUN npm link

# Create a startup script to register with OpenCLI
RUN echo '#!/bin/bash\n\
# Register blog-cli with OpenCLI if not already registered\n\
opencli register /app/blog-launcher.js || true\n\
# Execute the command passed to docker run\n\
exec "$@"' > /entrypoint.sh && \
    chmod +x /entrypoint.sh

# Expose port for service mode (if needed)
EXPOSE 8080

# Set entrypoint
ENTRYPOINT ["/entrypoint.sh"]

# Default command
CMD ["blog", "--help"]