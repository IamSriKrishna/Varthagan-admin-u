# CI/CD Migration to Reusable Workflow Templates

This document describes the migration of the admin-ui service to use the reusable GitHub Actions workflow templates from the `bbapp-grp/workflow-template` repository.

## What Changed

### Before (Original Workflows)

- **Complex custom workflows**: Each service had its own full CI/CD implementation
- **Code duplication**: Same logic repeated across all microservices
- **Manual maintenance**: Updates required changes in every repository
- **Inconsistent patterns**: Different approaches across services

### After (Reusable Templates)

- **Centralized logic**: All CI/CD logic in the workflow-template repository
- **DRY principle**: Single source of truth for all workflows
- **Easy maintenance**: Updates only needed in one place
- **Consistent patterns**: Standardized approach across all services

## New Workflow Structure

### Development Workflow (`.github/workflows/development.yml`)

```yaml
name: Development Build

on:
  push:
    branches: [develop]

jobs:
  build:
    uses: bbapp-grp/workflow-template/.github/workflows/development-build.yml@main
    with:
      service_name: "admin-ui"
      gcp_project_id: "bbapp-dev-440805"
      enable_tests: false # Temporarily disabled - no tests configured yet
    secrets:
      WIF_PROVIDER: ${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}
      WIF_SERVICE_ACCOUNT: ${{ secrets.GCP_SERVICE_ACCOUNT }}
```

**Benefits:**

- **Simplified**: Only 16 lines vs 75+ lines previously
- **Focused**: Only service-specific configuration
- **Maintainable**: Updates happen centrally

### Release Workflow (`.github/workflows/release.yml`)

```yaml
name: Release Build

on:
  push:
    branches: [main]

jobs:
  build:
    uses: bbapp-grp/workflow-template/.github/workflows/release-build.yml@main
    with:
      service_name: "admin-ui"
      gcp_project_id: "bbapp-dev-440805"
      enable_tests: false # Temporarily disabled - no tests configured yet
    secrets:
      WIF_PROVIDER: ${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}
      WIF_SERVICE_ACCOUNT: ${{ secrets.GCP_SERVICE_ACCOUNT }}
```

**Benefits:**

- **Simplified**: Only 16 lines vs 98+ lines previously
- **Consistent**: Same CalVer versioning across all services
- **Automated**: GitHub releases created automatically

## Image Naming Convention Changes

### Development Images

- **Old**: `admin-ui-dev:latest`
- **New**: `admin-ui:latest` and `admin-ui:develop-<sha>`

### Production Images

- **Old**: `admin-ui-stg:latest` and `admin-ui-stg:<calver>`
- **New**: `admin-ui:latest`, `admin-ui:<calver>`, and `admin-ui:v<calver>`

**Benefits:**

- **Consistent**: Same naming pattern across all microservices
- **GitOps-ready**: Optimized for FluxCD image automation
- **Traceable**: Commit-based tags for development debugging

## Configuration Options

The reusable workflows provide extensive configuration options:

### Available Parameters

| Parameter                  | Current Value           | Description                            |
| -------------------------- | ----------------------- | -------------------------------------- |
| `service_name`             | `"admin-ui"`            | Name of the microservice               |
| `gcp_project_id`           | `"bbapp-dev-440805"`    | GCP project for Artifact Registry      |
| `enable_tests`             | `false`                 | Whether to run tests before building   |
| `test_command`             | `"npm test"`            | Command to run tests (when enabled)    |
| `build_command`            | `""`                    | Pre-Docker build command (optional)    |
| `dockerfile_path`          | `"Dockerfile"`          | Path to Dockerfile (default: root)     |
| `build_context`            | `"."`                   | Docker build context (default: root)   |
| `node_version`             | `"20"`                  | Node.js version for test/build steps   |
| `artifact_registry_region` | `"us-central1"`         | Artifact Registry region               |
| `artifact_registry_repo`   | `"bbapp-microservices"` | AR repository name                     |
| `tag_prefix`               | `"v"`                   | Prefix for version tags (release only) |

### Future Customizations

When ready, you can easily customize the workflows:

```yaml
# Example: Enable tests
jobs:
  build:
    uses: bbapp-grp/workflow-template/.github/workflows/development-build.yml@main
    with:
      service_name: "admin-ui"
      gcp_project_id: "bbapp-dev-440805"
      enable_tests: true
      test_command: "npm run test:ci"
      build_command: "npm run build"
    secrets:
      WIF_PROVIDER: ${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}
      WIF_SERVICE_ACCOUNT: ${{ secrets.GCP_SERVICE_ACCOUNT }}
```

## Benefits of the Migration

### 1. Reduced Complexity

- **90% fewer lines**: Workflows reduced from 173 to 32 total lines
- **Zero duplication**: All common logic centralized
- **Single configuration**: Only service-specific settings needed

### 2. Improved Maintainability

- **Central updates**: Changes apply to all services automatically
- **Version pinning**: Can pin to specific template versions if needed
- **Easy rollback**: Simple to revert to previous template versions

### 3. Enhanced Consistency

- **Standardized patterns**: Same approach across all microservices
- **Unified logging**: Consistent output and debugging information
- **Shared best practices**: Security and performance optimizations for all

### 4. Better GitOps Integration

- **FluxCD ready**: Image naming optimized for Flux image automation
- **Metadata output**: Workflow outputs designed for GitOps tools
- **Per-service deployment**: Only changed services are redeployed

### 5. Developer Experience

- **Faster onboarding**: New services adopt CI/CD in minutes
- **Reduced cognitive load**: Focus on service code, not CI/CD plumbing
- **Better documentation**: Centralized guides and examples

## Testing the Migration

### 1. Development Workflow Test

```bash
# Make a small change and push to develop
git checkout develop
echo "// Test change" >> src/app/page.tsx
git add .
git commit -m "test: Verify new development workflow"
git push origin develop
```

**Expected Result:**

- Workflow triggers on develop branch push
- Image built and pushed as `admin-ui:latest` and `admin-ui:develop-<sha>`
- Clean, simplified workflow logs

### 2. Release Workflow Test

```bash
# Merge to main to trigger release
git checkout main
git merge develop
git push origin main
```

**Expected Result:**

- Workflow triggers on main branch push
- CalVer tag created (e.g., `v24.06.1`)
- Images built as `admin-ui:latest` and `admin-ui:24.06.1`
- GitHub release created automatically

## Rollback Plan

If issues arise, you can quickly rollback:

```bash
# Restore original workflows
cp .github/workflows/development.yml.backup .github/workflows/development.yml
cp .github/workflows/release.yml.backup .github/workflows/release.yml

# Commit and push
git add .github/workflows/
git commit -m "revert: Restore original workflows"
git push
```

## Next Steps

### 1. Enable Testing (When Ready)

Update workflows to enable tests:

```yaml
enable_tests: true
test_command: "npm run test:ci"
```

### 2. Add Build Steps (If Needed)

If you need pre-Docker builds:

```yaml
build_command: "npm run build"
```

### 3. Monitor Builds

- Watch GitHub Actions for successful builds
- Verify images in Artifact Registry
- Check that CalVer tagging works correctly

### 4. GitOps Integration

Once validated, set up FluxCD image automation:

- Configure ImageRepository for admin-ui
- Set up ImagePolicy for automatic updates
- Create development/production overlays

## Troubleshooting

### Common Issues

1. **Workflow not found error**
   - Ensure the workflow-template repository is public or accessible
   - Verify the path: `bbapp-grp/workflow-template/.github/workflows/development-build.yml@main`

2. **Authentication failures**
   - Verify `GCP_WORKLOAD_IDENTITY_PROVIDER` secret is set
   - Verify `GCP_SERVICE_ACCOUNT` secret is set
   - Check that WIF has proper permissions

3. **Image push failures**
   - Ensure Artifact Registry repository exists
   - Verify service account has Artifact Registry Writer role
   - Check project ID matches: `bbapp-dev-440805`

4. **Build failures**
   - Verify Dockerfile builds locally: `docker build .`
   - Check if tests are passing (if enabled)
   - Review build logs in GitHub Actions

### Getting Help

1. **Check workflow template documentation**: https://github.com/bbapp-grp/workflow-template
2. **Review template issues**: For bugs in the reusable workflows
3. **Service-specific issues**: Check logs and configuration in this repository

## Migration History

- **2024-06-24**: Migrated to reusable workflow templates
- **Backup files**: Original workflows preserved as `.backup` files
- **Template version**: Using `@main` (latest)
- **Configuration**: Basic setup with tests disabled initially

This migration is part of the broader effort to standardize CI/CD across all BBApp microservices and enable efficient GitOps-based deployments.
