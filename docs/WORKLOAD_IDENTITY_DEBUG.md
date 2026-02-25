# Workload Identity Debug Commands

## Check Current Configuration

### 1. Get Project Number

```bash
gcloud projects describe bb-app-461714 --format="value(projectNumber)"
```

### 2. Check Workload Identity Pool

```bash
gcloud iam workload-identity-pools describe github-actions \
  --project=bb-app-461714 \
  --location=global
```

### 3. Check Workload Identity Provider

```bash
gcloud iam workload-identity-pools providers describe github \
  --project=bb-app-461714 \
  --location=global \
  --workload-identity-pool=github-actions
```

### 4. Check Service Account IAM Policy

```bash
gcloud iam service-accounts get-iam-policy \
  github-actions-admin-ui@bb-app-461714.iam.gserviceaccount.com \
  --project=bb-app-461714
```

## Expected Repository Format

The repository should be in the format: `bbapp-grp/admin-ui`

### 5. Check if Service Account Binding is Correct

```bash
# Expected format in the IAM policy:
# member: principalSet://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions/attribute.repository/bbapp-grp/admin-ui
```

## Fix Commands (if needed)

### If repository binding is wrong:

```bash
# Get your project number first
PROJECT_NUMBER=$(gcloud projects describe bb-app-461714 --format="value(projectNumber)")

# Remove wrong binding (if exists)
gcloud iam service-accounts remove-iam-policy-binding \
  --project=bb-app-461714 \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions/attribute.repository/WRONG_REPO_NAME" \
  github-actions-admin-ui@bb-app-461714.iam.gserviceaccount.com

# Add correct binding
gcloud iam service-accounts add-iam-policy-binding \
  --project=bb-app-461714 \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions/attribute.repository/bbapp-grp/admin-ui" \
  github-actions-admin-ui@bb-app-461714.iam.gserviceaccount.com
```

### If attribute mapping is wrong:

```bash
# Update provider with correct attribute mapping
gcloud iam workload-identity-pools providers update-oidc github \
  --project=bb-app-461714 \
  --location=global \
  --workload-identity-pool=github-actions \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository"
```

## Test Token Generation (Debug)

Run this command to see what attributes GitHub is sending:

```bash
# This would show the JWT token attributes being sent
# (Only for debugging - don't run in production)
```
