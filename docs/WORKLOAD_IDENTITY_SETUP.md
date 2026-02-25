# Workload Identity Setup Guide

## 🎯 Overview

This guide sets up Workload Identity Federation to allow GitHub Actions to authenticate with Google Cloud Platform without storing service account keys as secrets.

## 🔧 Prerequisites

- GCP Project: `bb-app-461714`
- GitHub Repository: `bbapp-grp/admin-ui`
- gcloud CLI installed and authenticated
- Project Owner or Security Admin permissions

## 📋 Step-by-Step Setup

### Step 1: Enable Required APIs

```bash
# Enable required Google Cloud APIs
gcloud services enable iamcredentials.googleapis.com \
  --project=bb-app-461714

gcloud services enable sts.googleapis.com \
  --project=bb-app-461714

gcloud services enable artifactregistry.googleapis.com \
  --project=bb-app-461714
```

### Step 2: Create Workload Identity Pool

```bash
# Create the workload identity pool
gcloud iam workload-identity-pools create "github-actions" \
  --project="bb-app-461714" \
  --location="global" \
  --display-name="GitHub Actions Pool"
```

### Step 3: Create Workload Identity Provider

```bash
# Create the workload identity provider for GitHub
gcloud iam workload-identity-pools providers create-oidc "github" \
  --project="bb-app-461714" \
  --location="global" \
  --workload-identity-pool="github-actions" \
  --display-name="GitHub provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"
```

### Step 4: Create Service Account

```bash
# Create service account for GitHub Actions
gcloud iam service-accounts create github-actions-admin-ui \
  --project=bb-app-461714 \
  --display-name="GitHub Actions Admin UI" \
  --description="Service account for GitHub Actions CI/CD pipeline for admin-ui"
```

### Step 5: Grant Required Permissions

```bash
# Grant Artifact Registry permissions
gcloud projects add-iam-policy-binding bb-app-461714 \
  --member="serviceAccount:github-actions-admin-ui@bb-app-461714.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

# Grant storage permissions (for Docker layers)
gcloud projects add-iam-policy-binding bb-app-461714 \
  --member="serviceAccount:github-actions-admin-ui@bb-app-461714.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

# Grant basic viewer permissions
gcloud projects add-iam-policy-binding bb-app-461714 \
  --member="serviceAccount:github-actions-admin-ui@bb-app-461714.iam.gserviceaccount.com" \
  --role="roles/viewer"
```

### Step 6: Allow GitHub Repository to Impersonate Service Account

```bash
# Allow the GitHub repository to impersonate the service account
gcloud iam service-accounts add-iam-policy-binding \
  --project=bb-app-461714 \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions/attribute.repository/bbapp-grp/admin-ui" \
  github-actions-admin-ui@bb-app-461714.iam.gserviceaccount.com
```

**Note**: Replace `PROJECT_NUMBER` with your actual project number. Get it with:

```bash
gcloud projects describe bb-app-461714 --format="value(projectNumber)"
```

### Step 7: Get Configuration Values

```bash
# Get Workload Identity Provider resource name
gcloud iam workload-identity-pools providers describe "github" \
  --project="bb-app-461714" \
  --location="global" \
  --workload-identity-pool="github-actions" \
  --format="value(name)"
```

This will output something like:

```
projects/123456789/locations/global/workloadIdentityPools/github-actions/providers/github
```

## 🔑 GitHub Secrets Configuration

Add these secrets to your GitHub repository (`Settings` → `Secrets and variables` → `Actions`):

### Required Secrets:

1. **`WIF_PROVIDER`**

   ```
   projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions/providers/github
   ```

2. **`WIF_SERVICE_ACCOUNT`**
   ```
   github-actions-admin-ui@bb-app-461714.iam.gserviceaccount.com
   ```

## 🔍 Verification Commands

### Test Authentication

```bash
# Test the workload identity setup
gcloud iam workload-identity-pools providers describe "github" \
  --project="bb-app-461714" \
  --location="global" \
  --workload-identity-pool="github-actions"
```

### Test Service Account Permissions

```bash
# Test service account permissions
gcloud projects get-iam-policy bb-app-461714 \
  --flatten="bindings[].members" \
  --format="table(bindings.role)" \
  --filter="bindings.members:github-actions-admin-ui@bb-app-461714.iam.gserviceaccount.com"
```

## 🚀 Workflow Integration

Once the secrets are configured, update both workflow files by uncommenting the authentication sections:

### For `release.yml` and `development.yml`:

```yaml
- name: Authenticate to Google Cloud
  id: auth
  uses: google-github-actions/auth@v2
  with:
    workload_identity_provider: ${{ secrets.WIF_PROVIDER }}
    service_account: ${{ secrets.WIF_SERVICE_ACCOUNT }}

- name: Configure Docker for Artifact Registry
  run: gcloud auth configure-docker ${{ env.REGISTRY_REGION }}-docker.pkg.dev
```

And change `push: false` to `push: true` in the Docker build step.

## 🔒 Security Benefits

✅ **No Service Account Keys**: No sensitive JSON keys stored in GitHub
✅ **Repository-Scoped**: Only your specific repository can access the service account
✅ **Auditable**: All authentication events are logged in Google Cloud
✅ **Temporary Tokens**: Tokens are short-lived and automatically rotated
✅ **Principle of Least Privilege**: Service account has minimal required permissions

## 🐛 Troubleshooting

### Common Issues:

1. **Permission Denied Error**
   - Verify PROJECT_NUMBER is correct
   - Check service account IAM bindings
   - Ensure APIs are enabled

2. **Repository Not Found**
   - Verify GitHub repository name format: `bbapp-grp/admin-ui`
   - Check workload identity pool attribute mapping

3. **Token Exchange Failed**
   - Verify WIF_PROVIDER secret format
   - Check issuer URI configuration

### Debug Commands:

```bash
# Get project number
gcloud projects describe bb-app-461714 --format="value(projectNumber)"

# List workload identity pools
gcloud iam workload-identity-pools list --location=global --project=bb-app-461714

# Check service account exists
gcloud iam service-accounts list --project=bb-app-461714 --filter="email:github-actions-admin-ui*"
```

## 📞 Support

If you encounter issues:

1. Check the step-by-step commands above
2. Verify all prerequisites are met
3. Review Google Cloud IAM logs for authentication errors
4. Test with a simple workflow first before enabling image push

---

**Next Step**: Execute these commands in order, then configure GitHub secrets and update the workflow files.
