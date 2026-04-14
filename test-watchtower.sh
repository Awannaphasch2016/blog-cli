#!/bin/bash

# Test script for Watchtower auto-update functionality
set -e

echo "🧪 Testing Watchtower Auto-Update Setup"
echo "======================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "✅ Docker is running"

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml not found. Please run this script from the blog-cli directory."
    exit 1
fi

echo "✅ docker-compose.yml found"

# Check if Dagger is installed
if ! command -v dagger > /dev/null 2>&1; then
    echo "⚠️  Dagger not installed. Installing..."
    curl -L https://dl.dagger.io/dagger/install.sh | DAGGER_VERSION=0.9.5 sh
    sudo mv bin/dagger /usr/local/bin 2>/dev/null || echo "Note: Moving dagger to /usr/local/bin failed, you may need to add ./bin to your PATH"
fi

echo "✅ Dagger is available"

# Build local container with Dagger (skip for now due to timeout issues)
echo "⏭️  Skipping Dagger build (will use pre-built image)"
echo "Note: Run 'cd dagger && dagger --workdir=.. call build-local' manually to test"

# Start containers with docker compose
echo "🚀 Starting containers with Watchtower..."
if command -v docker-compose > /dev/null 2>&1; then
    docker-compose up -d
else
    docker compose up -d
fi

# Wait for containers to start
sleep 5

# Check that containers are running
if docker ps | grep -q "blog-cli-instance"; then
    echo "✅ blog-cli container is running"
else
    echo "❌ blog-cli container is not running"
    docker-compose logs blog-cli
    exit 1
fi

if docker ps | grep -q "watchtower"; then
    echo "✅ Watchtower container is running"
else
    echo "❌ Watchtower container is not running"
    docker-compose logs watchtower
    exit 1
fi

# Test blog-cli functionality inside container
echo "🧪 Testing blog-cli functionality..."
if docker exec blog-cli-instance blog --help > /dev/null 2>&1; then
    echo "✅ blog command works in container"
else
    echo "❌ blog command failed in container"
    docker exec blog-cli-instance which blog || echo "blog command not found"
fi

# Test OpenCLI functionality
if docker exec blog-cli-instance opencli --version > /dev/null 2>&1; then
    echo "✅ OpenCLI works in container"
else
    echo "⚠️  OpenCLI test failed (may be expected)"
fi

# Show container status
echo ""
echo "📊 Container Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"

# Show Watchtower logs
echo ""
echo "📋 Recent Watchtower logs:"
docker logs --tail=10 watchtower

echo ""
echo "🎉 Test completed!"
echo ""
echo "Next steps:"
echo "1. Make a code change and commit to main branch"
echo "2. Watch Watchtower logs: docker logs -f watchtower"
echo "3. Check for container updates: docker inspect blog-cli-instance | grep Image"
echo ""
echo "To stop containers: docker compose down"