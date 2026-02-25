#!/bin/bash

# Configuration Test Script
# Validates GCP and cluster configuration before building/deploying

echo "🔍 Testing BBApp Configuration..."
echo "========================================"

# Hardcoded GCP configuration
PROJECT_ID="bb-app-461714"
REGION="asia-south1"
LOCATION="asia-south1-a"
CLUSTER_NAME="bbapp-gke"
NAMESPACE="bbapp-dev"
IMAGE_NAME="bbapp-admin-ui"

echo "Project ID: $PROJECT_ID"
echo "Cluster Name: $CLUSTER_NAME"
echo "Cluster Location: $LOCATION"
echo "Region: $REGION"

# Test registry detection
echo ""
echo "🔍 Testing Registry Detection..."
if gcloud artifacts repositories describe bbapp --location=$REGION &>/dev/null; then
    REGISTRY_URL="${REGION}-docker.pkg.dev/${PROJECT_ID}/bbapp"
    echo "✅ Using Artifact Registry: $REGISTRY_URL"
else
    REGISTRY_URL="gcr.io/${PROJECT_ID}"
    echo "📦 Using Container Registry: $REGISTRY_URL"
fi

# Test git info
echo ""
echo "🔍 Testing Git Information..."
if git rev-parse --git-dir > /dev/null 2>&1; then
    CURRENT_BRANCH=$(git branch --show-current)
    LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")
    echo "Current Branch: $CURRENT_BRANCH"
    echo "Latest Git Tag: $LATEST_TAG"
    echo "Git Status:"
    git status --porcelain
else
    echo "❌ Not in a git repository"
fi

echo ""
echo "📋 Configuration Summary:"
echo "========================"
echo "Project: $PROJECT_ID"
echo "Cluster: $CLUSTER_NAME ($LOCATION)"
echo "Registry: $REGISTRY_URL"
echo "Namespace: $NAMESPACE"
echo "Image: $IMAGE_NAME"

echo ""
echo "✅ Configuration test completed!"
