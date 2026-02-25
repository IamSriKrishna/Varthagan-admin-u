# Multi-Microservice GitOps with Flux Image Automation

## 🎯 Architecture Overview

This setup enables automatic deployment of individual microservices when their images are updated, without affecting other services.

## 🏗️ Repository Structure

### K8s Manifests Repository Layout

```
k8s-manifests/
├── flux-system/
│   ├── gotk-components.yaml
│   ├── gotk-sync.yaml
│   └── kustomization.yaml
├── infrastructure/
│   ├── image-automation/
│   │   ├── image-repositories.yaml
│   │   ├── image-policies.yaml
│   │   └── image-update-automation.yaml
│   └── kustomization.yaml
└── apps/
    ├── admin-ui/
    │   ├── base/
    │   │   ├── deployment.yaml
    │   │   ├── service.yaml
    │   │   └── kustomization.yaml
    │   ├── dev/
    │   │   └── kustomization.yaml
    │   └── staging/
    │       └── kustomization.yaml
    ├── user-service/
    │   ├── base/
    │   ├── dev/
    │   └── staging/
    └── ... (8 more microservices)
```

## 🔧 Flux Image Automation Setup

### 1. Image Repositories (infrastructure/image-automation/image-repositories.yaml)

```yaml
# Scan all microservice images
apiVersion: image.toolkit.fluxcd.io/v1beta2
kind: ImageRepository
metadata:
  name: admin-ui-dev
  namespace: flux-system
spec:
  image: asia-south1-docker.pkg.dev/bb-app-461714/bbapp-images/admin-ui-dev
  interval: 1m
  provider: gcp
  secretRef:
    name: gcr-credentials

---
apiVersion: image.toolkit.fluxcd.io/v1beta2
kind: ImageRepository
metadata:
  name: admin-ui-staging
  namespace: flux-system
spec:
  image: asia-south1-docker.pkg.dev/bb-app-461714/bbapp-images/admin-ui-stg
  interval: 5m
  provider: gcp
  secretRef:
    name: gcr-credentials

---
# Repeat for all 10 microservices...
apiVersion: image.toolkit.fluxcd.io/v1beta2
kind: ImageRepository
metadata:
  name: user-service-dev
  namespace: flux-system
spec:
  image: asia-south1-docker.pkg.dev/bb-app-461714/bbapp-images/user-service-dev
  interval: 1m
  provider: gcp
  secretRef:
    name: gcr-credentials
```

### 2. Image Policies (infrastructure/image-automation/image-policies.yaml)

```yaml
# Policies for image selection
apiVersion: image.toolkit.fluxcd.io/v1beta2
kind: ImagePolicy
metadata:
  name: admin-ui-dev-policy
  namespace: flux-system
spec:
  imageRepositoryRef:
    name: admin-ui-dev
  policy:
    alphabetical:
      order: asc # Always use 'latest' for dev

---
apiVersion: image.toolkit.fluxcd.io/v1beta2
kind: ImagePolicy
metadata:
  name: admin-ui-staging-policy
  namespace: flux-system
spec:
  imageRepositoryRef:
    name: admin-ui-staging
  policy:
    semver:
      range: ">=25.0.0" # Use CalVer for staging

---
# Repeat for all microservices...
```

### 3. Image Update Automation (infrastructure/image-automation/image-update-automation.yaml)

```yaml
apiVersion: image.toolkit.fluxcd.io/v1beta1
kind: ImageUpdateAutomation
metadata:
  name: microservices-image-update
  namespace: flux-system
spec:
  interval: 30s
  sourceRef:
    kind: GitRepository
    name: flux-system
  git:
    checkout:
      ref:
        branch: main
    commit:
      author:
        email: flux@bbapp.dev
        name: Flux Image Automation
      messageTemplate: |
        chore: update {{range .Updated.Images}}{{println .}}{{end}}

        Automation: {{.AutomationObject}}
    push:
      branch: main
  update:
    path: "./apps"
    strategy: Setters
```

## 📦 Kustomization Examples

### Admin UI Development (apps/admin-ui/dev/kustomization.yaml)

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: bbapp-dev

resources:
  - ../base

images:
  - name: admin-ui
    newName: asia-south1-docker.pkg.dev/bb-app-461714/bbapp-images/admin-ui-dev
    newTag: latest # {"$imagepolicy": "flux-system:admin-ui-dev-policy"}

patchesStrategicMerge:
  - |-
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: admin-ui
    spec:
      template:
        spec:
          containers:
          - name: admin-ui
            resources:
              requests:
                cpu: 25m
                memory: 128Mi
              limits:
                cpu: 100m
                memory: 256Mi
```

### Admin UI Staging (apps/admin-ui/staging/kustomization.yaml)

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: bbapp-staging

resources:
  - ../base

images:
  - name: admin-ui
    newName: asia-south1-docker.pkg.dev/bb-app-461714/bbapp-images/admin-ui-stg
    newTag: 25.06.0 # {"$imagepolicy": "flux-system:admin-ui-staging-policy"}

patchesStrategicMerge:
  - |-
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: admin-ui
    spec:
      replicas: 2
      template:
        spec:
          containers:
          - name: admin-ui
            resources:
              requests:
                cpu: 50m
                memory: 256Mi
              limits:
                cpu: 200m
                memory: 512Mi
```

## 🔄 How It Works

### Flow for Each Microservice:

1. **Code Push** → GitHub Actions builds image
2. **Image Push** → Artifact Registry
3. **Flux Scans** → Detects new image (every 1-5 minutes)
4. **Manifest Update** → Updates only affected service's manifest
5. **Git Commit** → Automatic commit with changed image
6. **Selective Deploy** → Flux deploys only the changed service

### Key Benefits:

- ✅ **Independent Deployments**: Only changed services deploy
- ✅ **Fast Updates**: 1-minute detection for dev, 5-minute for staging
- ✅ **Git History**: All changes tracked in Git
- ✅ **Rollback Capability**: Git revert to previous image
- ✅ **Multi-Environment**: Different policies for dev vs staging

## 🚀 Scaling to 10 Microservices

### Automated Template Generation:

Each microservice follows the same pattern:

```bash
# Generate manifests for new microservice
SERVICE_NAME="payment-service"
cat > apps/${SERVICE_NAME}/dev/kustomization.yaml << EOF
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: bbapp-dev
resources:
  - ../base
images:
  - name: ${SERVICE_NAME}
    newName: asia-south1-docker.pkg.dev/bb-app-461714/bbapp-images/${SERVICE_NAME}-dev
    newTag: latest # {"$imagepolicy": "flux-system:${SERVICE_NAME}-dev-policy"}
EOF
```

## 📋 Implementation Steps

1. **Setup Flux Image Controllers** in your cluster
2. **Create Image Repositories** for all 10 microservices
3. **Define Image Policies** (latest for dev, semver for staging)
4. **Configure Image Update Automation**
5. **Structure Kustomize manifests** with image policy markers
6. **Test with admin-ui** first, then scale to other services

This approach gives you true GitOps with selective, automatic deployments! 🎯
