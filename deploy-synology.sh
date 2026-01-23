#!/bin/bash

# Psychedelic Speakeasy - Synology NAS Deployment Script
# ======================================================

set -e

# Configuration
SYNOLOGY_IP="${SYNOLOGY_IP:-192.168.1.84}"
SYNOLOGY_USER="${SYNOLOGY_USER:-Ben}"
SYNOLOGY_PATH="/volume1/docker/psychedelic-speakeasy"

echo "=========================================="
echo "Psychedelic Speakeasy - Synology Deployment"
echo "=========================================="

# Check if running locally or deploying
if [ "$1" == "local" ]; then
    echo "Starting local development with Docker..."
    docker-compose up --build
    exit 0
fi

if [ "$1" == "build" ]; then
    echo "Building Docker image locally..."
    docker build -t psychedelic-speakeasy:latest .
    echo "Build complete!"
    exit 0
fi

if [ "$1" == "deploy" ]; then
    echo "Deploying to Synology NAS at $SYNOLOGY_IP..."

    # Create directory on Synology
    echo "Creating deployment directory..."
    ssh "$SYNOLOGY_USER@$SYNOLOGY_IP" "mkdir -p $SYNOLOGY_PATH"

    # Copy files to Synology
    echo "Copying files to Synology..."
    scp -r docker-compose.yml Dockerfile package.json pnpm-lock.yaml .env "$SYNOLOGY_USER@$SYNOLOGY_IP:$SYNOLOGY_PATH/"
    scp -r client server shared patches drizzle "$SYNOLOGY_USER@$SYNOLOGY_IP:$SYNOLOGY_PATH/"

    # Build and start on Synology
    echo "Building and starting containers on Synology..."
    ssh "$SYNOLOGY_USER@$SYNOLOGY_IP" "cd $SYNOLOGY_PATH && docker-compose up -d --build"

    echo "=========================================="
    echo "Deployment complete!"
    echo "Access your site at: http://$SYNOLOGY_IP:3000"
    echo "Or via Tailscale: https://100.122.165.61:3000"
    echo "=========================================="
    exit 0
fi

# Show help
echo "Usage: ./deploy-synology.sh [command]"
echo ""
echo "Commands:"
echo "  local   - Run locally with Docker Compose"
echo "  build   - Build Docker image locally"
echo "  deploy  - Deploy to Synology NAS"
echo ""
echo "Environment variables:"
echo "  SYNOLOGY_IP   - Synology IP (default: 192.168.1.84)"
echo "  SYNOLOGY_USER - SSH username (default: Ben)"
