# BBApp Admin UI - Multi-Environment Deployment Scripts

## 🎯 Environment Strategy

### 🔧 Development (bbapp-dev)

- **Frequency**: Multiple times per day
- **Versioning**: Timestamp-based (no git tags)
- **Image Tags**: `v1.0.0-dev.20250623-143022.abc1234`
- **Deployment**: Quick and automated

### 🚀 Staging (bbapp-stg)

- **Frequency**: Bi-weekly releases
- **Versioning**: Semantic versioning with git tags
- **Image Tags**: `v1.2.3` (proper releases)
- **Deployment**: Controlled with manual approval

## 🏗️ Hardcoded Configuration

All scripts use hardcoded values for reliability:

- **Project ID**: `bb-app-461714`
- **Region**: `asia-south1`
- **Zone**: `asia-south1-a`
- **Cluster**: `bbapp-gke`
- **Namespaces**: `bbapp-dev` / `bbapp-stg`
- **Image Name**: `bbapp-admin-ui`

## 📋 Available Scripts

### 1. `test-config.sh`

Tests all prerequisites and configuration

```bash
./test-config.sh
```

### 2. `build-and-push.sh [env]`

Builds and pushes Docker image with environment-specific versioning

```bash
./build-and-push.sh dev     # Development build (timestamp-based)
./build-and-push.sh stg     # Staging build (creates git tag)
```

### 3. `deploy-gke.sh [env] [tag]`

Deploys to GKE cluster

```bash
./deploy-gke.sh dev         # Deploy latest dev build
./deploy-gke.sh stg         # Deploy latest staging release
./deploy-gke.sh stg v1.2.3  # Deploy specific version
```

### 4. `quick-dev-deploy.sh`

One-command dev deployment (build + deploy)

```bash
./quick-dev-deploy.sh       # Build and deploy to dev in one go
```

## 🚀 Deployment Workflows

### Development Workflow (Multiple times per day)

```bash
# Quick development deployment
./quick-dev-deploy.sh

# Or step by step
./build-and-push.sh dev
./deploy-gke.sh dev
```

### Staging Workflow (Bi-weekly)

```bash
# Create staging release with git tag
./build-and-push.sh stg

# Deploy staging release
./deploy-gke.sh stg
```

## 🏗️ Ory Stack Integration

Environment variables are dynamically configured for each environment:

### Development (bbapp-dev)

- **Kratos**: `kratos-public.bbapp-dev.svc.cluster.local:4433`
- **Hydra**: `hydra-public.bbapp-dev.svc.cluster.local:4444`
- **Oathkeeper**: `oathkeeper-proxy.bbapp-dev.svc.cluster.local:4455`
- **Keto Read**: `keto-read.bbapp-dev.svc.cluster.local:4466`
- **Keto Write**: `keto-write.bbapp-dev.svc.cluster.local:4467`

### Staging (bbapp-stg)

- **Kratos**: `kratos-public.bbapp-stg.svc.cluster.local:4433`
- **Hydra**: `hydra-public.bbapp-stg.svc.cluster.local:4444`
- **Oathkeeper**: `oathkeeper-proxy.bbapp-stg.svc.cluster.local:4455`
- **Keto Read**: `keto-read.bbapp-stg.svc.cluster.local:4466`
- **Keto Write**: `keto-write.bbapp-stg.svc.cluster.local:4467`

## 🔧 Image Tagging Strategy

### Development Images (SHA-based, No Versioning)

- **Format**: `dev-abc1234-20250623-143022`
- **Components**: `dev-{commit-hash}-{timestamp}`
- **Registry Tags**: `{tag}`, `dev` (latest dev build)
- **Git Tags**: None (clean repo)

### Staging Images (CalVer Versioning)

- **Format**: `2025.06.1`, `2025.06.2`, `2025.07.1`
- **Components**: Calendar Versioning (YYYY.MM.MICRO)
- **Registry Tags**: `{version}`, `stg`, `latest`
- **Git Tags**: Yes (release tracking)
- **Logic**: Auto-increment micro version within current month

## � **Deployment Strategy Summary**

| Environment     | Versioning        | Git Tags | Frequency    | Example Tag                   |
| --------------- | ----------------- | -------- | ------------ | ----------------------------- |
| **Development** | ❌ SHA-based only | ❌ None  | Multiple/day | `dev-abc1234-20250623-143022` |
| **Staging**     | ✅ CalVer         | ✅ Yes   | Bi-weekly    | `2025.06.1`                   |

## �📅 **CalVer Benefits (Staging Only)**

✅ **Time-based releases**: Perfect for bi-weekly cycles  
✅ **No semantic decisions**: Just increment within month  
✅ **Clear timeline**: Know exactly when released  
✅ **Automated increment**: No human judgment needed

Ready for SHA-based dev + CalVer staging deployments! 🎉
