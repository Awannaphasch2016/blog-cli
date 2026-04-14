# blog-cli with Watchtower Auto-Updates

This setup enables automatic updates of blog-cli containers using Watchtower when new commits are pushed to the main branch.

## Architecture

```
Commit → GitHub Actions + Dagger → GitHub Container Registry → Watchtower → Updated Containers
```

## Quick Start

### 1. GitHub Container Registry Setup

```bash
# No separate login needed - uses GitHub authentication automatically
# Registry URL: ghcr.io/awannaphasch2016/blog-cli
# Authentication handled by GITHUB_TOKEN in GitHub Actions
```

### 2. Test Locally

```bash
# Build and test the container
cd dagger
dagger call build-local

# Start Watchtower monitoring
docker-compose up -d

# Check that containers are running
docker ps
```

### 3. Test Auto-Updates

```bash
# Make a small change to the code
echo "console.log('Updated version');" >> src/test.js

# Commit and push
git add .
git commit -m "Test update"
git push origin main

# Watch Watchtower logs for auto-update
docker logs -f watchtower
```

## Local Development Workflow

### Build and Test with Dagger

```bash
# Build local container
dagger call build-local

# Run tests
dagger call run-tests

# Build and push (uses GitHub Container Registry)
dagger call build-and-push
```

### Monitor Watchtower

```bash
# View Watchtower logs
docker logs watchtower

# Check current image versions
docker inspect blog-cli-instance | grep Image

# Restart Watchtower (if needed)
docker restart watchtower
```

## Server Deployment

### Initial Setup on Each Server

```bash
# 1. Install Docker
curl -fsSL https://get.docker.com | sh

# 2. Start blog-cli container
docker run -d \
  --name blog-cli-instance \
  --restart unless-stopped \
  --label "com.centurylinklabs.watchtower.enable=true" \
  ghcr.io/awannaphasch2016/blog-cli:latest \
  tail -f /dev/null

# 3. Start Watchtower
docker run -d \
  --name watchtower \
  --restart unless-stopped \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower \
  --interval 300 \
  --cleanup \
  --label-enable
```

### Check Auto-Updates on Server

```bash
# Monitor Watchtower activity
docker logs -f watchtower

# Check current running version
docker inspect blog-cli-instance | grep -A5 -B5 Image

# Test blog-cli functionality
docker exec blog-cli-instance blog --help
```

## GitHub Actions Setup

### Required Secrets

No additional secrets required! GitHub Container Registry uses the built-in `GITHUB_TOKEN` automatically.

### Workflow Triggers

The workflow runs on:
- Push to main branch (builds and pushes)
- Pull requests (tests only)

## Troubleshooting

### Container Won't Update

```bash
# Check Watchtower logs
docker logs watchtower

# Manually pull latest image
docker pull ghcr.io/awannaphasch2016/blog-cli:latest

# Restart container with new image
docker stop blog-cli-instance
docker run -d \
  --name blog-cli-instance \
  --restart unless-stopped \
  --label "com.centurylinklabs.watchtower.enable=true" \
  ghcr.io/awannaphasch2016/blog-cli:latest
```

### Watchtower Not Running

```bash
# Check if Watchtower is running
docker ps | grep watchtower

# Start Watchtower if stopped
docker start watchtower

# View Watchtower logs for errors
docker logs watchtower
```

### Build Failures

```bash
# Test build locally
cd dagger
dagger call build-local

# Check GitHub Actions logs
# Go to: https://github.com/awannaphasch2016/blog-cli/actions
```

## Rollback

If an update causes issues:

```bash
# Stop auto-updates temporarily
docker stop watchtower

# Revert to specific version
docker stop blog-cli-instance
docker pull ghcr.io/awannaphasch2016/blog-cli:COMMIT_HASH
docker run -d \
  --name blog-cli-instance \
  ghcr.io/awannaphasch2016/blog-cli:COMMIT_HASH

# Restart auto-updates
docker start watchtower
```

## Next Steps

1. Test the complete workflow locally
2. Deploy to one test server
3. Verify auto-updates work end-to-end
4. Deploy to production servers
5. Monitor first production auto-update

## Benefits

✅ **Zero-downtime deployments** - Rolling updates
✅ **Automatic updates** - No manual intervention
✅ **Simple setup** - Just Docker, no Kubernetes
✅ **Fast rollback** - Pin to specific versions
✅ **Minimal overhead** - Watchtower uses ~20MB RAM