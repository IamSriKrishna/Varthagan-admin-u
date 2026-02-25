#!/bin/bash

# Build, Tag, and Push Script for BBApp Admin UI
# Handles git tagging, Docker image building, and pushing to Artifact Registry

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Hardcoded GCP configuration
print_info "Using hardcoded GCP configuration..."
PROJECT_ID="bb-app-461714"
REGION="asia-south1"
ZONE="asia-south1-a"
CLUSTER_NAME="bbapp-gke"
IMAGE_NAME="bbapp-admin-ui"

# Environment parameter (dev or stg)
ENVIRONMENT=${1:-"dev"}
if [[ "$ENVIRONMENT" != "dev" && "$ENVIRONMENT" != "stg" ]]; then
    print_error "Invalid environment. Use 'dev' or 'stg'"
    echo "Usage: $0 [dev|stg]"
    exit 1
fi

NAMESPACE="bbapp-${ENVIRONMENT}"
print_info "Environment: $ENVIRONMENT"
print_info "Namespace: $NAMESPACE"

# Validate GCP configuration (no validation needed for hardcoded values)
print_info "Project: $PROJECT_ID"
print_info "Region: $REGION"
print_info "Zone: $ZONE"
print_info "Cluster: $CLUSTER_NAME"
print_info "Image: $IMAGE_NAME"

# Check git status
print_info "Checking git status..."
if ! git diff-index --quiet HEAD --; then
    print_error "Working directory is not clean. Please commit or stash your changes."
    git status --porcelain
    exit 1
fi

# Get current git info
CURRENT_BRANCH=$(git branch --show-current)
CURRENT_COMMIT=$(git rev-parse --short HEAD)
print_info "Branch: $CURRENT_BRANCH"
print_info "Commit: $CURRENT_COMMIT"

# Generate version tag based on environment
print_info "🏷️ Generating image tag..."

if [[ "$ENVIRONMENT" == "dev" ]]; then
    # For dev: use commit hash only (no versioning)
    COMMIT_SHORT=$(git rev-parse --short HEAD)
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    VERSION_TAG="dev-${COMMIT_SHORT}-${TIMESTAMP}"
    print_info "Dev environment: Using commit-based tag (no versioning)"
    print_success "Generated tag: $VERSION_TAG"
elif [[ "$ENVIRONMENT" == "stg" ]]; then
    # For staging: use CalVer with conflict resolution
    print_info "Staging environment: Creating CalVer tag with conflict resolution..."
    
    # Use the robust CalVer script (handles all conflict resolution)
    if [[ -f "scripts/create-calver-tag.sh" ]]; then
        print_info "Using robust CalVer script..."
        if VERSION_TAG=$(bash scripts/create-calver-tag.sh 2>/dev/null); then
            print_success "Generated CalVer tag: $VERSION_TAG"
        else
            print_error "Failed to generate CalVer tag using script"
            exit 1
        fi
    else
        # Fallback to inline CalVer logic
        print_info "CalVer script not found, using inline logic..."
        if VERSION_TAG=$(generate_calver_with_conflict_resolution); then
            print_success "Generated CalVer tag: $VERSION_TAG"
        else
            print_error "Failed to generate CalVer tag"
            exit 1
        fi
    fi
fi

# Note: Git tag creation is now handled by the CalVer script for staging
if [[ "$ENVIRONMENT" == "stg" ]]; then
    print_success "CalVer git tag created and pushed: $VERSION_TAG"
else
    print_info "🏷️ No git tag for dev environment (SHA-based deployment only)"
fi

# Configure Docker for Artifact Registry
print_info "🔧 Configuring Docker for Artifact Registry..."
gcloud auth configure-docker ${REGION}-docker.pkg.dev --quiet

# Determine registry type and build image URLs
if gcloud artifacts repositories describe bbapp --location=$REGION &>/dev/null; then
    # Use Artifact Registry
    REGISTRY_URL="${REGION}-docker.pkg.dev/${PROJECT_ID}/bbapp"
    print_info "Using Artifact Registry"
else
    # Use Container Registry
    REGISTRY_URL="gcr.io/${PROJECT_ID}"
    print_info "Using Container Registry"
    gcloud auth configure-docker --quiet
fi

FULL_IMAGE_NAME="${REGISTRY_URL}/${IMAGE_NAME}"
IMAGE_WITH_TAG="${FULL_IMAGE_NAME}:${VERSION_TAG}"
IMAGE_WITH_ENV="${FULL_IMAGE_NAME}:${ENVIRONMENT}"
IMAGE_WITH_LATEST="${FULL_IMAGE_NAME}:latest"

# Build Docker image
print_info "🏗️ Building Docker image..."
docker build \
    --platform linux/amd64 \
    -t "$IMAGE_WITH_TAG" \
    -t "$IMAGE_WITH_ENV" \
    -t "$IMAGE_WITH_LATEST" \
    --build-arg VERSION="$VERSION_TAG" \
    --build-arg ENVIRONMENT="$ENVIRONMENT" \
    --build-arg BUILD_DATE="$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
    --build-arg GIT_COMMIT="$(git rev-parse HEAD)" \
    .

print_success "Docker image built: $IMAGE_WITH_TAG"

# Push Docker images
print_info "📤 Pushing Docker images..."
docker push "$IMAGE_WITH_TAG"
docker push "$IMAGE_WITH_ENV"
if [[ "$ENVIRONMENT" == "stg" ]]; then
    docker push "$IMAGE_WITH_LATEST"  # Only update latest for staging
fi
print_success "Images pushed to registry"

# Create/update deployment manifest
print_info "Creating deployment manifest..."
mkdir -p k8s

cat > k8s/deployment.yaml << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: admin-ui
  namespace: $NAMESPACE
  labels:
    app: admin-ui
    version: $VERSION_TAG
spec:
  replicas: 2
  selector:
    matchLabels:
      app: admin-ui
  template:
    metadata:
      labels:
        app: admin-ui
        version: $VERSION_TAG
    spec:
      containers:
      - name: admin-ui
        image: $IMAGE_WITH_TAG
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: ENVIRONMENT
          value: "$ENVIRONMENT"
        - name: NEXT_PUBLIC_KRATOS_PUBLIC_URL
          value: "http://kratos-public.bbapp-${ENVIRONMENT}.svc.cluster.local:4433"
        - name: NEXT_PUBLIC_HYDRA_PUBLIC_URL
          value: "http://hydra-public.bbapp-${ENVIRONMENT}.svc.cluster.local:4444"
        - name: NEXT_PUBLIC_OATHKEEPER_URL
          value: "http://oathkeeper-proxy.bbapp-${ENVIRONMENT}.svc.cluster.local:4455"
        - name: NEXT_PUBLIC_KETO_READ_URL
          value: "http://keto-read.bbapp-${ENVIRONMENT}.svc.cluster.local:4466"
        - name: NEXT_PUBLIC_KETO_WRITE_URL
          value: "http://keto-write.bbapp-${ENVIRONMENT}.svc.cluster.local:4467"
        - name: NEXT_PUBLIC_APP_URL
          value: "https://admin-ui.bbapp-${ENVIRONMENT}.example.com"
        - name: NEXT_PUBLIC_API_BASE_URL
          value: "http://api.bbapp-${ENVIRONMENT}.svc.cluster.local:8080"
        resources:
          requests:
            memory: "128Mi"
            cpu: "25m"
          limits:
            memory: "256Mi"
            cpu: "100m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: admin-ui-service
  namespace: $NAMESPACE
  labels:
    app: admin-ui
spec:
  selector:
    app: admin-ui
  ports:
  - port: 80
    targetPort: 3000
    protocol: TCP
  type: ClusterIP
---
apiVersion: v1
kind: Namespace
metadata:
  name: $NAMESPACE
  labels:
    name: $NAMESPACE
EOF

print_success "Deployment manifest created: k8s/deployment.yaml"

# Display summary
print_info "Build Summary:"
echo "=================="
echo "Git Tag: $VERSION_TAG"
echo "Docker Image: $IMAGE_WITH_TAG"
echo "Registry: $REGISTRY_URL"
echo "Namespace: $NAMESPACE"
echo "=================="

print_info "Next steps:"
echo "1. Deploy to GKE: ./deploy-gke.sh $ENVIRONMENT"
echo "2. Or apply manually: kubectl apply -f k8s/deployment.yaml"

print_success "Build and push completed successfully!"

# Fallback CalVer generation function (used when scripts/create-calver-tag.sh is not available)
generate_calver_with_conflict_resolution() {
    local max_retries=10
    local retry_count=0
    
    # Generate base CalVer tag (YY.MM.PATCH format like v25.06.1)
    local year=$(date +%y)  # Use 2-digit year
    local month=$(date +%m)
    local year_month="${year}.${month}"
    
    print_info "Fetching all remote tags to ensure we have the latest..."
    git fetch --tags 2>/dev/null || true
    
    # Find the highest patch version for this month from ALL tags (local + remote)
    local latest_patch=0
    
    # Check both local and remote tags
    local all_tags=""
    all_tags=$(git tag -l "v${year_month}.*" 2>/dev/null || true)
    
    # Also check remote tags in case local is not up to date
    local remote_tags=""
    remote_tags=$(git ls-remote --tags origin | grep "refs/tags/v${year_month}\." | sed 's/.*refs\/tags\///' 2>/dev/null || true)
    
    # Combine and process all tags
    local combined_tags="${all_tags}"$'\n'"${remote_tags}"
    
    while IFS= read -r existing_tag; do
        if [[ -n "$existing_tag" && "$existing_tag" =~ ^v${year_month}\.([0-9]+)$ ]]; then
            local patch_version="${BASH_REMATCH[1]}"
            if [[ "$patch_version" -gt "$latest_patch" ]]; then
                latest_patch="$patch_version"
            fi
        fi
    done <<< "$combined_tags"
    
    print_info "Latest patch version found for ${year_month}: ${latest_patch}"
    
    # Start with the next patch version
    local new_patch=$((latest_patch + 1))
    
    # Retry loop to handle race conditions
    while [[ $retry_count -lt $max_retries ]]; do
        local candidate_tag="v${year_month}.${new_patch}"
        
        print_info "Trying tag: $candidate_tag (attempt $((retry_count + 1))/$max_retries)"
        
        # Check if tag already exists locally
        if git tag -l "$candidate_tag" | grep -q "^${candidate_tag}$" 2>/dev/null; then
            print_warning "Tag $candidate_tag already exists locally, incrementing..."
            new_patch=$((new_patch + 1))
            retry_count=$((retry_count + 1))
            continue
        fi
        
        # Check if tag exists remotely
        if git ls-remote --tags origin | grep -q "refs/tags/${candidate_tag}$" 2>/dev/null; then
            print_warning "Tag $candidate_tag already exists remotely, incrementing..."
            new_patch=$((new_patch + 1))
            retry_count=$((retry_count + 1))
            continue
        fi
        
        # Try to create and push the tag atomically
        if git tag "$candidate_tag" 2>/dev/null; then
            print_info "Created local tag: $candidate_tag"
            if git push origin "$candidate_tag" 2>/dev/null; then
                print_success "Successfully pushed tag: $candidate_tag"
                echo "$candidate_tag"
                return 0
            else
                print_warning "Failed to push tag $candidate_tag, likely created by concurrent process"
                git tag -d "$candidate_tag" 2>/dev/null || true
                new_patch=$((new_patch + 1))
                retry_count=$((retry_count + 1))
                continue
            fi
        else
            print_warning "Failed to create local tag $candidate_tag"
            new_patch=$((new_patch + 1))
            retry_count=$((retry_count + 1))
            continue
        fi
    done
    
    print_error "Failed to create CalVer tag after $max_retries retries"
    return 1
}
