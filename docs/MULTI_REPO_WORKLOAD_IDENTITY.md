# Multi-Repository Workload Identity Setup

## 🎯 Recommended: Organization-Wide Access

### Step 1: Update Provider Attribute Mapping (if needed)

```bash
gcloud iam workload-identity-pools providers update-oidc github \
  --project=bb-app-461714 \
  --location=global \
  --workload-identity-pool=github-actions \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner"
```

### Step 2: Remove Single Repository Binding (if exists)

```bash
PROJECT_NUMBER=$(gcloud projects describe bb-app-461714 --format="value(projectNumber)")

# Remove existing single-repo binding
gcloud iam service-accounts remove-iam-policy-binding \
  --project=bb-app-461714 \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions/attribute.repository/bbapp-grp/admin-ui" \
  github-actions-admin-ui@bb-app-461714.iam.gserviceaccount.com
```

### Step 3: Add Organization-Wide Binding

```bash
# Allow all repositories in bbapp-grp organization
gcloud iam service-accounts add-iam-policy-binding \
  --project=bb-app-461714 \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions/attribute.repository_owner/bbapp-grp" \
  github-actions-admin-ui@bb-app-461714.iam.gserviceaccount.com
```

## 🏗️ Organization Variables Setup

Update your GitHub organization to use these variables and secrets across all repositories:

### Organization Variables

```yaml
GCP_PROJECT_ID: bb-app-461714
GCP_REGION: asia-south1
ARTIFACT_REGISTRY_REPOSITORY: bbapp-images
REGISTRY_URL: asia-south1-docker.pkg.dev/bb-app-461714/bbapp-images
```

### Organization Secrets

```yaml
GCP_WORKLOAD_IDENTITY_PROVIDER: projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions/providers/github
GCP_SERVICE_ACCOUNT: github-actions-admin-ui@bb-app-461714.iam.gserviceaccount.com
```

## 🚀 Multi-Service Workflow Template

Each microservice can use the same workflow pattern:

```yaml
# .github/workflows/development.yml (in each repo)
name: Development Build

on:
  push:
    branches: [develop]

env:
  PROJECT_ID: ${{ vars.GCP_PROJECT_ID }}
  REGISTRY: ${{ vars.GCP_REGION }}-docker.pkg.dev
  REPOSITORY: ${{ vars.ARTIFACT_REGISTRY_REPOSITORY }}
  # Each repo has its own image name
  IMAGE_NAME: ${{ github.event.repository.name }}-dev

jobs:
  development:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write

    steps:
      - uses: actions/checkout@v4

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}
          service_account: ${{ secrets.GCP_SERVICE_ACCOUNT }}

      - name: Configure Docker
        run: gcloud auth configure-docker ${{ env.REGISTRY }}

      - name: Build and Push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.PROJECT_ID }}/${{ env.REPOSITORY }}/${{ env.IMAGE_NAME }}:latest
```

## 🎯 Benefits of Organization-Wide Setup

### For Your 10 Microservices:

- ✅ **Single configuration** works for all repositories
- ✅ **No per-repo setup** needed in GCP
- ✅ **Consistent naming**: `{repo-name}-dev`, `{repo-name}-stg`
- ✅ **Easy scaling** to new microservices
- ✅ **Centralized management** via organization settings

### Security Considerations:

- ✅ **Scoped to organization**: Only `bbapp-grp` repositories
- ✅ **Same permissions**: Controlled artifact registry access
- ✅ **Audit trail**: All actions logged per repository
- ✅ **Easy revocation**: Remove organization access if needed

## 📋 Implementation Steps

1. **Run the commands above** to update Workload Identity
2. **Test with admin-ui** repository first
3. **Copy workflow files** to other microservice repositories
4. **Update IMAGE_NAME** in each repository's workflow
5. **Verify builds** work for each service

This approach will scale perfectly for your 10 microservices and any future additions!
