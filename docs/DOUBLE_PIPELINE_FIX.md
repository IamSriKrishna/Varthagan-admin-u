# Double Pipeline Fix - CI/CD Workflow Optimization

## Problem

Every commit to `main` branch was triggering **TWO pipelines simultaneously**:

1. `release.yml` workflow
2. `deploy.yml` workflow

This caused:

- ❌ Duplicate resource usage
- ❌ Conflicting deployments
- ❌ Confusing pipeline results
- ❌ Race conditions between workflows

## Root Cause Analysis

### Before Fix:

```yaml
# .github/workflows/release.yml
on:
  push:
    branches: [ main ]  # ← Triggers on every push to main

# .github/workflows/deploy.yml
on:
  push:
    branches: [ main ]  # ← ALSO triggers on every push to main
  pull_request:
    branches: [ main ]
```

## Solution Applied

### 1. Updated Release Workflow Trigger

Changed `release.yml` to trigger on **tags instead of pushes**:

```yaml
# .github/workflows/release.yml
on:
  push:
    tags:
      - "v*.*.*" # Only trigger on version tags like v25.06.1
```

### 2. Disabled Legacy Deploy Workflow

Disabled `deploy.yml` since it's been replaced by the modern workflow template system:

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy to GKE (LEGACY - DISABLED)

on:
  workflow_dispatch: # Only manual trigger - never runs automatically
    inputs:
      confirm:
        description: "This workflow is disabled. Use release.yml instead."
        required: true
        default: "disabled"
```

## How the New Flow Works

### Optimized Pipeline Flow:

1. **Developer pushes code to main** → No automatic pipeline (clean!)
2. **CalVer script creates and pushes tag** → `release.yml` triggers once
3. **Release workflow runs**:
   - Runs tests
   - Builds and pushes Docker image
   - Updates K8s manifests via GitOps

### Benefits:

- ✅ **Single pipeline per release** - no duplicates
- ✅ **Tag-based releases** - more controlled deployment
- ✅ **Clear separation** - development vs release workflows
- ✅ **Resource optimization** - no wasted CI/CD runs
- ✅ **Better traceability** - each release has a specific tag

## Pipeline Triggers Summary

| Trigger Event      | Before      | After       |
| ------------------ | ----------- | ----------- |
| Push to main       | 2 pipelines | 0 pipelines |
| Create tag v*.*.\* | 0 pipelines | 1 pipeline  |
| Push to develop    | 1 pipeline  | 1 pipeline  |
| Manual workflow    | 1 pipeline  | 1 pipeline  |

## Verification

To test the fix:

1. Push code to main → Should trigger no pipelines
2. Run CalVer script → Should create tag and trigger release.yml only
3. Check GitHub Actions → Should see single pipeline execution

## Files Modified

- `.github/workflows/release.yml` - Changed trigger from push to tag
- `.github/workflows/deploy.yml` - Disabled legacy workflow
- `scripts/create-calver-tag.sh` - Fixed emoji/CI compatibility
- `scripts/universal-calver-tag.sh` - Fixed emoji/CI compatibility

## Result

🎉 **Single, clean pipeline execution per release with proper tag-based deployment!**
