# Reusable Workflow Strategy for 10 Microservices

## 🎯 Solution: GitHub Reusable Workflows

### **Option 1: Centralized Organization Template (Recommended)**

#### **Step 1: Create Template Repository**

```
bbapp-grp/.github/
└── workflows/
    ├── build-microservice.yml     # Reusable workflow
    ├── deploy-microservice.yml    # Reusable workflow
    └── README.md
```

#### **Step 2: Reusable Workflow Template**

```yaml
# .github/workflows/build-microservice.yml (in bbapp-grp/.github repo)
name: Build Microservice

on:
  workflow_call:
    inputs:
      service_name:
        required: true
        type: string
        description: "Name of the microservice (e.g., admin-ui, user-service)"
      environment:
        required: true
        type: string
        description: "Environment (dev or stg)"
      branch:
        required: true
        type: string
        description: "Branch name (develop or main)"
      dockerfile_path:
        required: false
        type: string
        default: "./Dockerfile"
        description: "Path to Dockerfile"
    secrets:
      GCP_WORKLOAD_IDENTITY_PROVIDER:
        required: true
      GCP_SERVICE_ACCOUNT:
        required: true

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Generate image tag
        id: tag
        run: |
          if [ "${{ inputs.environment }}" = "stg" ]; then
            # CalVer for staging
            YEAR=$(date +'%y')
            MONTH=$(date +'%m')
            LATEST_TAG=$(git tag -l "${YEAR}.${MONTH}.*" | sort -V | tail -n1)
            if [ -z "$LATEST_TAG" ]; then
              PATCH=0
            else
              PATCH=$(echo $LATEST_TAG | cut -d. -f3)
              PATCH=$((PATCH + 1))
            fi
            TAG="${YEAR}.${MONTH}.${PATCH}"
            git config user.name "github-actions[bot]"
            git config user.email "github-actions[bot]@users.noreply.github.com"
            git tag $TAG
            git push origin $TAG
          else
            # Latest for development
            TAG="latest"
          fi

          echo "tag=$TAG" >> $GITHUB_OUTPUT
          echo "image_name=${{ inputs.service_name }}-${{ inputs.environment }}" >> $GITHUB_OUTPUT

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}
          service_account: ${{ secrets.GCP_SERVICE_ACCOUNT }}

      - name: Configure Docker
        run: gcloud auth configure-docker ${{ vars.GCP_REGION }}-docker.pkg.dev

      - name: Build and Push
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ${{ inputs.dockerfile_path }}
          push: true
          tags: |
            ${{ vars.GCP_REGION }}-docker.pkg.dev/${{ vars.GCP_PROJECT_ID }}/${{ vars.ARTIFACT_REGISTRY_REPOSITORY }}/${{ steps.tag.outputs.image_name }}:${{ steps.tag.outputs.tag }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          platforms: linux/amd64
          build-args: |
            BUILDTIME=${{ github.run_id }}
            VERSION=${{ inputs.environment }}-${{ github.sha }}

    outputs:
      image_name: ${{ steps.tag.outputs.image_name }}
      image_tag: ${{ steps.tag.outputs.tag }}
      full_image: ${{ vars.GCP_REGION }}-docker.pkg.dev/${{ vars.GCP_PROJECT_ID }}/${{ vars.ARTIFACT_REGISTRY_REPOSITORY }}/${{ steps.tag.outputs.image_name }}:${{ steps.tag.outputs.tag }}
```

#### **Step 3: Individual Service Workflows**

```yaml
# .github/workflows/development.yml (in each microservice repo)
name: Development Build

on:
  push:
    branches: [develop]

jobs:
  build:
    uses: bbapp-grp/.github/.github/workflows/build-microservice.yml@main
    with:
      service_name: ${{ github.event.repository.name }} # auto-detects repo name
      environment: "dev"
      branch: "develop"
    secrets:
      GCP_WORKLOAD_IDENTITY_PROVIDER: ${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}
      GCP_SERVICE_ACCOUNT: ${{ secrets.GCP_SERVICE_ACCOUNT }}

  update_manifests:
    needs: build
    uses: bbapp-grp/.github/.github/workflows/update-k8s-manifests.yml@main
    with:
      service_name: ${{ github.event.repository.name }}
      environment: "dev"
      image_tag: ${{ needs.build.outputs.image_tag }}
    secrets: inherit
```

## **Option 2: Composite Actions**

Create reusable action components:

```yaml
# .github/actions/build-microservice/action.yml
name: "Build Microservice"
description: "Build and push microservice Docker image"
inputs:
  service_name:
    description: "Service name"
    required: true
  environment:
    description: "Environment (dev/stg)"
    required: true

runs:
  using: "composite"
  steps:
    - name: Build logic here...
```

## **Option 3: Template Repository**

Create a template repository that can be copied for new microservices.

## 🎯 **Recommended Implementation**

### **For Your 10 Microservices: Option 1 (Reusable Workflows)**

#### **Benefits:**

- ✅ **Single source of truth** for build logic
- ✅ **Automatic service name detection** using `${{ github.event.repository.name }}`
- ✅ **Environment-specific logic** (dev vs staging)
- ✅ **Easy updates** - change once, affects all services
- ✅ **Consistent across all microservices**

#### **Structure:**

```
bbapp-grp/
├── .github/               # Template repository
│   └── workflows/
│       ├── build-microservice.yml
│       ├── update-k8s-manifests.yml
│       └── notify-slack.yml
├── admin-ui/              # Each microservice
│   └── .github/workflows/
│       ├── development.yml    # 3 lines calling template
│       └── release.yml        # 3 lines calling template
├── user-service/
├── auth-service/
└── ... (7 more services)
```

#### **Per-Service Workflow (Only 10 lines!):**

```yaml
name: Development Build
on:
  push:
    branches: [develop]

jobs:
  build-and-deploy:
    uses: bbapp-grp/.github/.github/workflows/build-microservice.yml@main
    with:
      service_name: ${{ github.event.repository.name }}
      environment: "dev"
      branch: "develop"
    secrets: inherit
```

## 📋 **Implementation Steps**

1. **Create `bbapp-grp/.github` repository**
2. **Move reusable workflows there**
3. **Update all 10 microservice workflows** to use templates
4. **Test with admin-ui first**
5. **Roll out to other services**

This approach will reduce your workflow files from ~70 lines each to ~10 lines each, while maintaining all functionality and making updates much easier!
