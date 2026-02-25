#!/bin/bash

# Quick Dev Deploy Script
# For rapid development deployments - builds and deploys in one command

# INFRASTRUCTURE REQUIREMENTS:
# ============================
# DNS Configuration:
#   - Create DNS record: dev-admin.bbcloud.app pointing to the cluster ingress
#   - This should be configured in the infra repository
#
# Ingress Configuration:
#   - Add Traefik ingress rule in the infra repository for:
#     - Host: dev-admin.bbcloud.app
#     - Service: admin-ui-service
#     - Namespace: bbapp-dev
#     - Port: 80
#
# Note: After DNS and ingress are configured, the admin UI will be accessible at:
# https://dev-admin.bbcloud.app

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo "🚀 Quick Dev Deploy - BBApp Admin UI"
echo "===================================="

# Check if we're in dev environment
ENVIRONMENT="dev"

print_info "Building and deploying to $ENVIRONMENT environment..."

# Step 1: Build and push
print_info "Step 1: Building and pushing Docker image..."
./build-and-push.sh $ENVIRONMENT

if [ $? -ne 0 ]; then
    print_error "Build failed!"
    exit 1
fi

print_success "Build completed successfully!"

# Step 2: Deploy to GKE
print_info "Step 2: Deploying to GKE..."
./deploy-gke.sh $ENVIRONMENT

if [ $? -ne 0 ]; then
    print_error "Deployment failed!"
    exit 1
fi

print_success "🎉 Quick dev deploy completed successfully!"
print_info "Your admin UI is now running in the bbapp-dev namespace"

# Show pods status
echo ""
print_info "📋 Current deployment status:"
kubectl get pods -n bbapp-dev -l app=admin-ui
