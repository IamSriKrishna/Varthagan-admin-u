#!/bin/bash

# Workload Identity Setup Verification and Repair Script
# This script checks and recreates the Workload Identity configuration for GitHub Actions

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

# Configuration
PROJECT_ID="bb-app-461714"
POOL_ID="github-pool"
PROVIDER_ID="github-provider"
SERVICE_ACCOUNT_NAME="github-actions"
GITHUB_ORG="bbapp-grp"  # Change this to your GitHub organization
GITHUB_REPO="admin-ui"   # Change this to your repository name

print_info "🔍 Workload Identity Setup Verification"
print_info "========================================"
print_info "Project ID: $PROJECT_ID"
print_info "Pool ID: $POOL_ID"
print_info "Provider ID: $PROVIDER_ID"
print_info "Service Account: $SERVICE_ACCOUNT_NAME"
print_info "GitHub Org: $GITHUB_ORG"
print_info "GitHub Repo: $GITHUB_REPO"

# Function to check if gcloud is authenticated
check_gcloud_auth() {
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "."; then
        print_error "You're not authenticated with gcloud. Please run: gcloud auth login"
        exit 1
    fi
    print_success "gcloud authentication verified"
}

# Function to set the project
set_project() {
    print_info "Setting project to $PROJECT_ID..."
    gcloud config set project "$PROJECT_ID"
    print_success "Project set to $PROJECT_ID"
}

# Function to enable required APIs
enable_apis() {
    print_info "Enabling required Google Cloud APIs..."
    gcloud services enable iamcredentials.googleapis.com
    gcloud services enable sts.googleapis.com
    gcloud services enable cloudresourcemanager.googleapis.com
    gcloud services enable container.googleapis.com
    gcloud services enable artifactregistry.googleapis.com
    print_success "Required APIs enabled"
}

# Function to check if Workload Identity Pool exists
check_workload_identity_pool() {
    print_info "Checking if Workload Identity Pool exists..."
    if gcloud iam workload-identity-pools describe "$POOL_ID" --location=global --quiet &>/dev/null; then
        print_success "Workload Identity Pool '$POOL_ID' exists"
        return 0
    else
        print_warning "Workload Identity Pool '$POOL_ID' does not exist"
        return 1
    fi
}

# Function to create Workload Identity Pool
create_workload_identity_pool() {
    print_info "Creating Workload Identity Pool..."
    gcloud iam workload-identity-pools create "$POOL_ID" \
        --location=global \
        --display-name="GitHub Actions Pool" \
        --description="Pool for GitHub Actions authentication"
    print_success "Workload Identity Pool '$POOL_ID' created"
}

# Function to check if Workload Identity Provider exists
check_workload_identity_provider() {
    print_info "Checking if Workload Identity Provider exists..."
    if gcloud iam workload-identity-pools providers describe "$PROVIDER_ID" \
        --workload-identity-pool="$POOL_ID" \
        --location=global --quiet &>/dev/null; then
        print_success "Workload Identity Provider '$PROVIDER_ID' exists"
        return 0
    else
        print_warning "Workload Identity Provider '$PROVIDER_ID' does not exist"
        return 1
    fi
}

# Function to create Workload Identity Provider
create_workload_identity_provider() {
    print_info "Creating Workload Identity Provider..."
    gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_ID" \
        --workload-identity-pool="$POOL_ID" \
        --location=global \
        --issuer-uri="https://token.actions.githubusercontent.com" \
        --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
        --attribute-condition="assertion.repository=='${GITHUB_ORG}/${GITHUB_REPO}'"
    print_success "Workload Identity Provider '$PROVIDER_ID' created"
}

# Function to check if service account exists
check_service_account() {
    print_info "Checking if service account exists..."
    if gcloud iam service-accounts describe "${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" --quiet &>/dev/null; then
        print_success "Service account '$SERVICE_ACCOUNT_NAME' exists"
        return 0
    else
        print_warning "Service account '$SERVICE_ACCOUNT_NAME' does not exist"
        return 1
    fi
}

# Function to create service account
create_service_account() {
    print_info "Creating service account..."
    gcloud iam service-accounts create "$SERVICE_ACCOUNT_NAME" \
        --display-name="GitHub Actions Service Account" \
        --description="Service account for GitHub Actions CI/CD"
    print_success "Service account '$SERVICE_ACCOUNT_NAME' created"
}

# Function to bind service account to Workload Identity Pool
bind_service_account() {
    print_info "Binding service account to Workload Identity Pool..."
    gcloud iam service-accounts add-iam-policy-binding \
        "${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
        --role="roles/iam.workloadIdentityUser" \
        --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/attribute.repository/${GITHUB_ORG}/${GITHUB_REPO}"
    print_success "Service account bound to Workload Identity Pool"
}

# Function to grant necessary roles to service account
grant_roles() {
    print_info "Granting necessary roles to service account..."
    
    local roles=(
        "roles/storage.admin"
        "roles/artifactregistry.writer"
        "roles/container.admin"
        "roles/iam.serviceAccountUser"
        "roles/container.clusterViewer"
    )
    
    for role in "${roles[@]}"; do
        print_info "Granting role: $role"
        gcloud projects add-iam-policy-binding "$PROJECT_ID" \
            --member="serviceAccount:${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
            --role="$role"
    done
    
    print_success "All necessary roles granted"
}

# Function to get project number
get_project_number() {
    PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)")
    print_info "Project number: $PROJECT_NUMBER"
}

# Function to display final configuration
display_configuration() {
    print_info "📋 Final Configuration"
    print_info "====================="
    echo "Add these to your GitHub repository secrets:"
    echo ""
    echo "GCP_WORKLOAD_IDENTITY_PROVIDER:"
    echo "projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/providers/${PROVIDER_ID}"
    echo ""
    echo "GCP_SERVICE_ACCOUNT:"
    echo "${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
    echo ""
    echo "Add these to your GitHub repository variables:"
    echo ""
    echo "GCP_PROJECT_ID: $PROJECT_ID"
    echo "GCP_REGION: asia-south1"
    echo "ARTIFACT_REGISTRY_REPOSITORY: bbapp"
    echo ""
    print_success "Setup completed successfully!"
}

# Main execution
main() {
    check_gcloud_auth
    set_project
    get_project_number
    enable_apis
    
    # Check and create Workload Identity Pool
    if ! check_workload_identity_pool; then
        create_workload_identity_pool
    fi
    
    # Check and create Workload Identity Provider
    if ! check_workload_identity_provider; then
        create_workload_identity_provider
    fi
    
    # Check and create service account
    if ! check_service_account; then
        create_service_account
    fi
    
    # Bind service account and grant roles
    bind_service_account
    grant_roles
    
    # Display final configuration
    display_configuration
}

# Run main function
main "$@"
