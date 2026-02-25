# Admin UI Production Deployment Checklist

## 📋 Pre-Deployment Setup

### 1. GitHub Repository Variables (Production Environment)

Configure these in GitHub Settings → Environments → production → Variables:

```
GCP_WORKLOAD_IDENTITY_PROVIDER_PRD = "projects/1234567890/locations/global/workloadIdentityPools/github-actions/providers/github-provider"
GCP_SERVICE_ACCOUNT_PRD = "github-actions@light-depot-471209-j7.iam.gserviceaccount.com"
GCP_PROJECT_ID_PRD = "light-depot-471209-j7"
GCP_REGION_PRD = "asia-south1"
GCP_ZONE_PRD = "asia-south1"
ARTIFACT_REGISTRY_REPOSITORY_PRD = "bbapp-images"
GKE_CLUSTER_NAME_PRD = "bbapp-cluster-prod"
```

### 2. GitHub Repository Secrets

These should already exist (standard GitHub secrets):

- `GITHUB_TOKEN` (automatically provided by GitHub)

### 3. Production Database Access

- [ ] Admin UI doesn't need direct database access (uses APIs)
- [ ] Verify API endpoints are accessible:
  - `https://auth.api.bbapp.in/health`
  - `https://customers.api.bbapp.in/health`
  - `https://products.api.bbapp.in/health`

## 🏗️ Infrastructure Files Created

### ✅ GitHub Workflow

- `/.github/workflows/release.yml` - Updated for production deployment

### ✅ Kubernetes Production Overlay

- `/k8s/overlays/prod/kustomization.yaml` - Main production configuration
- `/k8s/overlays/prod/deployment-patch.yaml` - Production deployment settings
- `/k8s/overlays/prod/configmap-patch.yaml` - Production environment variables

### ✅ Base Configuration Fixed

- `/k8s/base/deployment.yaml` - Updated to use image placeholder

## 🚀 Deployment Process

### Step 1: Configure GitHub Variables

1. Go to `https://github.com/bbapp-grp/admin-ui/settings/environments`
2. Create/select `production` environment
3. Add all the variables listed above

### Step 2: Deploy via GitHub Actions

1. Push changes to `main` branch
2. GitHub Actions will automatically:
   - Run tests
   - Build Docker image with CalVer tagging
   - Deploy to production namespace `bbapp-prod`

### Step 3: Verify Deployment

```bash
# Check deployment status
kubectl get pods -n bbapp-prod -l app=admin-ui

# Check service
kubectl get svc -n bbapp-prod -l app=admin-ui

# Check logs
kubectl logs -n bbapp-prod -l app=admin-ui

# Test health endpoint
curl https://admin.bbapp.in/api/health
```

## 🔧 Configuration Summary

### Production Domains

- **Admin UI**: `https://admin.bbapp.in`
- **API Base**: `https://auth.api.bbapp.in`

### Resource Allocation

- **CPU Request**: 50m
- **Memory Request**: 128Mi
- **CPU Limit**: 200m
- **Memory Limit**: 512Mi
- **Replicas**: 1

### Environment Variables

- `ENVIRONMENT=production`
- `PORT=80`
- `NEXT_PUBLIC_APP_URL=https://admin.bbapp.in`
- `NEXT_PUBLIC_API_BASE_URL=https://auth.api.bbapp.in`
- API service URLs for all microservices

## 🔍 Post-Deployment Checklist

### Functional Tests

- [ ] Admin UI loads at `https://admin.bbapp.in`
- [ ] Login functionality works
- [ ] API calls to microservices work
- [ ] Dashboard displays data correctly

### Monitoring

- [ ] Check pod health and resource usage
- [ ] Verify SSL certificate is valid
- [ ] Monitor application logs for errors
- [ ] Test autoscaling if configured

### DNS & Ingress

- [ ] DNS resolves `admin.bbapp.in` correctly
- [ ] SSL certificate is valid and trusted
- [ ] HTTP redirects to HTTPS work
- [ ] No certificate warnings in browser

## 🔧 Production Configuration Details

### Container Registry

Using production registry: `asia-south1-docker.pkg.dev/light-depot-471209-j7/bbapp-images/admin-ui`

### Versioning Strategy

- Uses CalVer format: `vYY.MM.PATCH`
- Automatic tagging on main branch
- Example: `v24.09.0`, `v24.09.1`, etc.

### Deployment Target

- **Namespace**: `bbapp-prod`
- **Cluster**: `bbapp-cluster-prod`
- **Region**: `asia-south1`

## 🚨 Troubleshooting

### Common Issues

1. **Image Pull Issues**: Check WIF authentication and registry permissions
2. **Pod Not Starting**: Verify ConfigMap values and resource limits
3. **503 Errors**: Check ingress configuration and service endpoints
4. **API Connection Issues**: Verify microservice health and SSL certificates

### Debug Commands

```bash
# Describe pod for detailed info
kubectl describe pod -n bbapp-prod -l app=admin-ui

# Check events
kubectl get events -n bbapp-prod --sort-by='.lastTimestamp'

# Test from inside cluster
kubectl run debug --rm -i --tty --image=alpine -- sh
# Inside pod: wget -qO- http://admin-ui-service.bbapp-prod:80/api/health
```
