# Admin UI Kubernetes Deployment with Kustomize

This directory contains Kubernetes manifests for the Admin UI service using Kustomize for better deployment management.

## Structure

```
k8s/
├── base/                    # Base Kubernetes resources
│   ├── kustomization.yaml   # Base kustomization config
│   ├── deployment.yaml      # Base deployment
│   ├── service.yaml         # Service and Ingress
│   ├── configmap.yaml       # Base configuration
│   └── namespace.yaml       # Namespace definition
└── overlays/               # Environment-specific overrides
    ├── dev/                # Development environment
    │   ├── kustomization.yaml
    │   └── configmap-patch.yaml
    └── stg/                # Staging environment
        ├── kustomization.yaml
        ├── deployment-patch.yaml
        ├── configmap-patch.yaml
        └── ingress-patch.yaml
```

## Environments

### Development (`dev`)

- **Namespace**: `bbapp-dev`
- **Hostname**: `dev-admin.bbcloud.app`
- **Resources**: Lower limits (128Mi memory, 25m CPU)

### Staging (`stg`)

- **Namespace**: `bbapp-stg`
- **Hostname**: `stg-admin.bbcloud.app`
- **Resources**: Higher limits (512Mi memory, 200m CPU)

## Deployment

### Manual Deployment

```bash
# Deploy to development
kubectl apply -k k8s/overlays/dev

# Deploy to staging
kubectl apply -k k8s/overlays/stg
```

### CI/CD Pipeline

The GitHub Actions workflow automatically:

1. **Builds** the Docker image with a version tag
2. **Updates** the image tag in `k8s/overlays/stg/kustomization.yaml`
3. **Deploys** using `kubectl apply -k k8s/overlays/stg`

Example CI/CD command:

```bash
# Update image tag (done automatically by CI/CD)
cd k8s/overlays/stg
kustomize edit set image admin-ui-image=asia-south1-docker.pkg.dev/bb-app-461714/bbapp-images/admin-ui:v24.08.1

# Deploy
kubectl apply -k .
```

## Key Benefits

✅ **No hardcoded or latest image tags** - CI/CD pipeline uses commit SHA for dev and CalVer for staging
✅ **Environment separation** - Different configs for dev/staging
✅ **Consistent labeling** - Proper resource organization
✅ **Configuration management** - Environment-specific settings
✅ **Uniform with other services** - Matches partner-service pattern

## Configuration

Environment variables are managed through ConfigMaps with environment-specific overrides:

- **Base config**: Common settings for all environments
- **Dev patch**: Development-specific URLs and settings
- **Staging patch**: Staging-specific URLs and settings

The deployment uses `envFrom` to load all environment variables from the ConfigMap.
