# Admin UI Production Deployment - GitHub Configuration

## Required Repository Variables

Go to: `https://github.com/bbapp-grp/admin-ui/settings/variables/actions`

**Production Environment Variables:**

```
GCP_WORKLOAD_IDENTITY_PROVIDER_PRD = projects/123456789/locations/global/workloadIdentityPools/github-actions/providers/github-actions-provider
GCP_SERVICE_ACCOUNT_PRD = github-actions@light-depot-471209-j7.iam.gserviceaccount.com
GCP_REGION_PRD = asia-south1
GCP_PROJECT_ID_PRD = light-depot-471209-j7
ARTIFACT_REGISTRY_REPOSITORY_PRD = bbapp-images
GKE_CLUSTER_NAME_PRD = bbapp-prod-cluster
GCP_ZONE_PRD = asia-south1-a
```

## Required Repository Secrets

Go to: `https://github.com/bbapp-grp/admin-ui/settings/secrets/actions`

- No additional secrets required (uses GITHUB_TOKEN automatically)

## Deployment Checklist

- [ ] Set GitHub variables above
- [ ] Merge develop branch to main
- [ ] Push to trigger production deployment
- [ ] Monitor GitHub Actions workflow
- [ ] Verify deployment at https://admin.bbapp.in
- [ ] Test admin login functionality

## Files Modified for Production

1. `.env.production` - Updated domains to bbapp.in
2. `.github/workflows/release.yml` - Added production deployment
3. `k8s/overlays/prod/` - Complete production overlay
4. `k8s/base/deployment.yaml` - Fixed image placeholder

## Production URLs

- **Admin UI**: https://admin.bbapp.in
- **API Base**: https://auth.api.bbapp.in
- **All Services**: https://\*.api.bbapp.in pattern# Updated GitHub variables for production deployment

# Fixed WLI provider names: github-provider (not github-pool-provider)
