# Double Pipeline Fix - Final Solution

## ❌ Problem: Chicken & Egg with Tag-Based Triggers

Initially tried to fix double pipelines by using tag-based triggers:

```yaml
on:
  push:
    tags: ["v*.*.*"] # Only trigger on tags
```

But this created a **chicken-and-egg problem**:

1. CalVer script runs **inside the CI workflow**
2. CalVer script creates and pushes the tag
3. Workflow only triggers on tag pushes
4. **Result**: No workflow ever runs! 🥚🐔

## ✅ Solution: Smart Author-Based Filtering

**Trigger on push to main BUT skip if author is `github-actions[bot]`**

### Updated Workflow:

```yaml
# .github/workflows/release.yml
on:
  push:
    branches: [main]

jobs:
  test:
    name: Run Tests
    # Skip if the push author is github-actions[bot] (automated tag pushes)
    if: github.event.head_commit.author.name != 'github-actions[bot]'
    uses: bbapp-grp/workflow-template/.github/workflows/nodejs-test.yml@main
    # ... test configuration

  build:
    name: Build and Push
    needs: test
    if: success() && github.event.head_commit.author.name != 'github-actions[bot]'
    uses: bbapp-grp/workflow-template/.github/workflows/release-build.yml@main
    # ... build configuration

  update-manifests:
    name: Update K8s Manifests
    needs: build
    if: success() && github.event.head_commit.author.name != 'github-actions[bot]'
    uses: bbapp-grp/workflow-template/.github/workflows/gitops-update.yml@main
    # ... manifest update configuration
```

### Updated CalVer Scripts:

Added tag message with author identification:

```bash
# Both scripts now create annotated tags
git tag "$NEW_TAG" -m "Release $NEW_TAG [skip ci]"
```

## How It Works Now

### Perfect Pipeline Flow:

1. **Developer pushes code to main**
   - Author: `developer-name`
   - ✅ **Triggers release.yml** (author is not github-actions[bot])

2. **Release workflow runs:**
   - Runs tests
   - Builds Docker image
   - **CalVer script creates and pushes tag**
   - Updates K8s manifests

3. **CalVer tag push happens**
   - Author: `github-actions[bot]` (automatic)
   - ❌ **Does NOT trigger release.yml** (author is github-actions[bot])

## Legacy Workflow Disabled

```yaml
# .github/workflows/deploy.yml - DISABLED
on:
  workflow_dispatch: # Only manual trigger
    inputs:
      confirm:
        description: "This workflow is disabled. Use release.yml instead."
```

## Result Summary

| Event              | Author                | Release Pipeline | Deploy Pipeline |
| ------------------ | --------------------- | ---------------- | --------------- |
| User pushes code   | `developer`           | ✅ Runs          | ❌ Disabled     |
| CalVer creates tag | `github-actions[bot]` | ❌ Skipped       | ❌ Disabled     |

## Benefits

- ✅ **Single pipeline per release** - no duplicates
- ✅ **No chicken-and-egg issues** - workflows trigger correctly
- ✅ **Smart filtering** - skips automated pushes
- ✅ **Resource optimization** - no wasted CI runs
- ✅ **Backward compatible** - existing flow unchanged

## Files Updated

- `.github/workflows/release.yml` - Added author-based conditional logic
- `.github/workflows/deploy.yml` - Disabled legacy workflow
- `scripts/create-calver-tag.sh` - Added tag message with [skip ci]
- `scripts/universal-calver-tag.sh` - Added tag message with [skip ci]

🎉 **Perfect single-pipeline execution achieved!**
