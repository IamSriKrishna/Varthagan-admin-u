# K8s Workflow Environment Fix

## Problem

The main branch (release) workflow was failing when trying to update Kubernetes manifests with the following error:

```
❌ kustomization.yaml not found in overlays/prod
```

## Root Cause

The `release.yml` workflow was configured to use `kustomize_path: 'overlays/prod'` but the k8s repository only has:

- `admin-ui/overlays/dev` (development environment)
- `admin-ui/overlays/stg` (staging environment)

There is no production environment (`overlays/prod`) set up yet.

## Solution

Updated the workflow configuration to use the correct staging environment path:

### Changes Made

#### Before:

```yaml
kustomize_path: "overlays/prod"
create_pr: true # Create PR for production environment
```

#### After:

```yaml
kustomize_path: "admin-ui/overlays/stg"
create_pr: true # Create PR for staging environment
```

## Verification

- ✅ Development workflow uses `admin-ui/overlays/dev` (correct)
- ✅ Release workflow now uses `admin-ui/overlays/stg` (fixed)
- ✅ Both environments exist in the k8s repository
- ✅ Kustomization files have been fixed for security compliance

## Impact

- ✅ Main branch builds will now successfully update staging manifests
- ✅ No more "kustomization.yaml not found" errors
- ✅ Proper environment targeting for each branch:
  - `develop` branch → `admin-ui/overlays/dev`
  - `main` branch → `admin-ui/overlays/stg`

## Files Fixed

- `.github/workflows/release.yml` - Updated kustomize_path to use staging environment

## Related Fixes

This fix is part of the broader CI/CD pipeline improvements including:

- CalVer CI compatibility fix (removing emojis)
- K8s repository restructuring for kustomize security compliance
- Proper environment targeting for GitOps workflows

## Next Steps

When a production environment is ready:

1. Create `admin-ui/overlays/prod` in the k8s repository
2. Update the release workflow to target production
3. Consider using staging for pre-production testing and main for production
