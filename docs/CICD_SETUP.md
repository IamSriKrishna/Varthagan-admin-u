# CI/CD Setup Guide

## Overview

This guide sets up automated build, push, and deploy pipeline using GitHub Actions with Google Cloud Workload Identity Federation - the most secure and recommended approach.

## ✅ Benefits

- **No Secret Keys**: Uses Workload Identity (Google's recommended method)
- **Automated**: Deploys on every push to main
- **Secure**: No credentials stored in GitHub
- **Cost-Effective**: Uses GitHub's build infrastructure
- **Resource Efficient**: Doesn't consume your cluster's CPU for builds

## 🚀 Setup Instructions

### Step 1: Enable APIs in Google Cloud

```bash
gcloud services enable \
    container.googleapis.com \
    cloudbuild.googleapis.com \
    iamcredentials.googleapis.com
```

### Step 2: Create Workload Identity Pool

```bash
# Create the workload identity pool
gcloud iam workload-identity-pools create "github-pool" \
    --location="global" \
    --description="GitHub Actions Pool" \
    --display-name="GitHub Actions Pool"

# Get the pool ID
export WORKLOAD_IDENTITY_POOL_ID=$(gcloud iam workload-identity-pools describe "github-pool" \
    --location="global" \
    --format="value(name)")

# Create the workload identity provider
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
    --location="global" \
    --workload-identity-pool="github-pool" \
    --display-name="GitHub provider" \
    --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.actor=assertion.actor,attribute.aud=assertion.aud" \
    --issuer-uri="https://token.actions.githubusercontent.com"
```

### Step 3: Create Service Account

```bash
# Create service account for GitHub Actions
gcloud iam service-accounts create github-actions \
    --description="Service account for GitHub Actions" \
    --display-name="GitHub Actions"

# Grant necessary permissions
gcloud projects add-iam-policy-binding bb-app-461714 \
    --member="serviceAccount:github-actions@bb-app-461714.iam.gserviceaccount.com" \
    --role="roles/container.developer"

gcloud projects add-iam-policy-binding bb-app-461714 \
    --member="serviceAccount:github-actions@bb-app-461714.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding bb-app-461714 \
    --member="serviceAccount:github-actions@bb-app-461714.iam.gserviceaccount.com" \
    --role="roles/container.clusterViewer"
```

### Step 4: Bind Service Account to Workload Identity

```bash
# Allow GitHub Actions to impersonate the service account
gcloud iam service-accounts add-iam-policy-binding \
    github-actions@bb-app-461714.iam.gserviceaccount.com \
    --role="roles/iam.workloadIdentityUser" \
    --member="principalSet://iam.googleapis.com/${WORKLOAD_IDENTITY_POOL_ID}/attribute.repository/bbapp-grp/admin-ui"
```

### Step 5: Update GitHub Workflow

Update the workflow file (`.github/workflows/deploy.yml`) with your specific values:

- `GKE_CLUSTER`: Your cluster name
- `GKE_ZONE`: Your cluster zone/region
- Repository name in the workload identity binding

### Step 6: Configure Repository Settings

1. Go to your GitHub repository
2. Go to Settings > Actions > General
3. Ensure "Allow GitHub Actions" is enabled
4. Under "Workflow permissions", select "Read and write permissions"

## 🔄 How It Works

### Trigger Events

- **Push to main**: Builds and deploys automatically
- **Pull Request**: Builds only (for testing)

### Build Process

1. Checkout code
2. Authenticate with Google Cloud (no keys needed!)
3. Build Docker image with commit SHA tag
4. Push to Google Container Registry
5. Update Kubernetes manifests with new image
6. Deploy to GKE cluster
7. Verify deployment success

### Image Tagging Strategy

- `gcr.io/bb-app-461714/admin-ui:COMMIT_SHA` (specific version)
- `gcr.io/bb-app-461714/admin-ui:latest` (latest build)

## 📊 Resource Optimization

### Current Settings (Optimized for Your Cluster)

- **CPU Request**: 25m (minimal allocation)
- **CPU Limit**: 100m (burst capacity)
- **Memory Request**: 128Mi
- **Memory Limit**: 256Mi

### Why This Helps Your 60% CPU Usage

- Minimal CPU footprint per pod
- Efficient resource utilization
- Builds happen on GitHub (not your cluster)
- No local development resource consumption

## 🔍 Monitoring

### Check Deployment Status

```bash
# Via GitHub Actions (automatic)
# Check the Actions tab in your GitHub repository

# Manual verification
kubectl get pods -n bbapp-dev -l app=admin-ui
kubectl describe deployment admin-ui -n bbapp-dev
```

### Rollback if Needed

```bash
kubectl rollout undo deployment/admin-ui -n bbapp-dev
```

## 🎯 Alternative Approaches (Less Recommended)

### Option 2: Cloud Build (Google-native)

- More expensive than GitHub Actions
- Requires additional setup
- Good if you want everything in Google Cloud

### Option 3: GitLab CI/CD

- Free tier available
- Good Docker/Kubernetes integration
- Requires migrating from GitHub

### Option 4: ArgoCD (GitOps)

- Best for complex multi-environment setups
- Requires additional infrastructure
- Overkill for single environment

## 🚀 Getting Started

1. Run the setup commands above
2. Commit and push the workflow file
3. Watch your first automated deployment!

The workflow will automatically deploy your optimized admin UI (25m CPU) whenever you push to main, without consuming your cluster's CPU for builds or requiring any manual credential sharing.
