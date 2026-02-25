# BBApp Admin UI - Build and Deploy Guide

This guide explains how to build and deploy the BBApp Admin UI to Google Kubernetes Engine (GKE) with Ory Stack integration.

## Prerequisites

1. **Google Cloud CLI** configured with your project:

   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Docker** installed and running

3. **kubectl** configured for your GKE cluster

4. **Git** repository with proper access

## Quick Start

### 1. Build and Push Image

```bash
# This script will:
# - Check git status and create a new version tag
# - Build Docker image with the version tag
# - Push to Google Artifact Registry or Container Registry
# - Generate Kubernetes deployment manifests
./build-and-push.sh
```

### 2. Deploy to GKE

```bash
# This script will:
# - Auto-detect GCP configuration from gcloud
# - Deploy to the bbapp-dev namespace
# - Use the latest git tag as image version
./deploy-gke.sh

# Or deploy a specific version:
./deploy-gke.sh v1.2.3
```

## Scripts Overview

### `build-and-push.sh`

- **Purpose**: Handles git tagging, Docker image building, and pushing to registry
- **Features**:
  - Automatic version increment (patch level)
  - Git status validation
  - Support for both Artifact Registry and Container Registry
  - Generates Kubernetes manifests with correct image references
  - Creates versioned and 'latest' tags

### `deploy-gke.sh`

- **Purpose**: Deploys the application to GKE
- **Features**:
  - Auto-detects GCP project, cluster, and region from gcloud config
  - Uses latest git tag as default image version
  - Validates image exists before deployment
  - Updates deployment manifest with correct image reference
  - Deploys to bbapp-dev namespace

## Environment Configuration

The application is configured to work with the Ory Stack in the `bbapp-dev` namespace:

- **Kratos**: `http://kratos-public.bbapp-dev.svc.cluster.local:4433`
- **Hydra**: `http://hydra-public.bbapp-dev.svc.cluster.local:4444`
- **Oathkeeper**: `http://oathkeeper-proxy.bbapp-dev.svc.cluster.local:4455`
- **Keto**:
  - Read: `http://keto-read.bbapp-dev.svc.cluster.local:4466`
  - Write: `http://keto-write.bbapp-dev.svc.cluster.local:4467`

## Registry Support

The scripts automatically detect and use:

- **Artifact Registry** (preferred): `{region}-docker.pkg.dev/{project}/bbapp`
- **Container Registry** (fallback): `gcr.io/{project}`

## Workflow Example

```bash
# 1. Make your changes
git add .
git commit -m "Add new feature"
git push origin main

# 2. Build and tag
./build-and-push.sh
# This creates git tag v1.2.3, builds image, and pushes to registry

# 3. Deploy to GKE
./deploy-gke.sh
# This deploys the latest tagged version to GKE

# Or deploy specific version
./deploy-gke.sh v1.2.3
```

## Monitoring Deployment

```bash
# Check pod status
kubectl get pods -n bbapp-dev -l app=admin-ui

# Check service
kubectl get svc -n bbapp-dev admin-ui-service

# View logs
kubectl logs -n bbapp-dev -l app=admin-ui

# Port forward for local testing
kubectl port-forward -n bbapp-dev svc/admin-ui-service 3000:80
```

## Troubleshooting

### Image Not Found

```bash
# Check if image exists in registry
docker manifest inspect {registry-url}/bbapp-admin-ui:{tag}

# Rebuild and push
./build-and-push.sh
```

### Deployment Issues

```bash
# Check deployment status
kubectl describe deployment admin-ui -n bbapp-dev

# Check pod logs
kubectl logs -n bbapp-dev -l app=admin-ui --tail=100
```

### Health Check

The application exposes a health endpoint at `/api/health` for Kubernetes probes.

```bash
# Test health endpoint
curl http://localhost:3000/api/health
```

## Security Notes

- Environment variables for production should be managed through Kubernetes ConfigMaps/Secrets
- The current configuration uses cluster-internal service URLs for Ory Stack components
- External access should be configured through Ingress controllers with proper TLS termination
