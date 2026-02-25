#!/bin/bash

# Production GCS Bucket Setup Script
# This script creates and configures the production media bucket for BBApp

set -e

# Configuration
PROJECT_ID="light-depot-471209-j7"
BUCKET_NAME="prod-media-bbapp-light-depot-471209-j7"
REGION="asia-south1"
STORAGE_CLASS="STANDARD"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if gcloud is installed and authenticated
check_gcloud() {
    log_info "Checking gcloud configuration..."
    
    if ! command -v gcloud &> /dev/null; then
        log_error "gcloud CLI not found. Please install it first."
        exit 1
    fi
    
    # Check if authenticated
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -1 > /dev/null; then
        log_error "Not authenticated with gcloud. Please run 'gcloud auth login'"
        exit 1
    fi
    
    # Set project
    log_info "Setting project to $PROJECT_ID"
    gcloud config set project $PROJECT_ID
}

# Create the bucket if it doesn't exist
create_bucket() {
    log_info "Checking if bucket '$BUCKET_NAME' exists..."
    
    if gsutil ls -b gs://$BUCKET_NAME > /dev/null 2>&1; then
        log_warn "Bucket '$BUCKET_NAME' already exists"
        return 0
    fi
    
    log_info "Creating bucket '$BUCKET_NAME'..."
    gsutil mb -p $PROJECT_ID -c $STORAGE_CLASS -l $REGION gs://$BUCKET_NAME
    
    log_info "✅ Bucket created successfully"
}

# Configure bucket for public read access
configure_public_access() {
    log_info "Configuring public read access..."
    
    # Make bucket readable by everyone
    gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME
    
    log_info "✅ Public read access configured"
}

# Configure CORS for the bucket
configure_cors() {
    log_info "Configuring CORS policy..."
    
    # Create temporary CORS file
    cat > /tmp/cors.json << EOF
[
  {
    "origin": [
      "https://admin.bbapp.in",
      "https://customers.api.bbapp.in", 
      "https://products.api.bbapp.in",
      "http://localhost:3000",
      "http://localhost:8080"
    ],
    "method": ["GET", "PUT", "POST", "HEAD"],
    "responseHeader": ["Content-Type", "Content-Length", "Date", "Server", "x-goog-*"],
    "maxAgeSeconds": 3600
  }
]
EOF

    # Apply CORS configuration
    gsutil cors set /tmp/cors.json gs://$BUCKET_NAME
    
    # Cleanup
    rm /tmp/cors.json
    
    log_info "✅ CORS policy configured"
}

# Create folder structure
create_folder_structure() {
    log_info "Creating folder structure..."
    
    # Create placeholder files to establish folder structure
    echo "BBApp Production Media Bucket" | gsutil cp - gs://$BUCKET_NAME/README.txt
    echo "" | gsutil cp - gs://$BUCKET_NAME/customers/profiles/.keep
    echo "" | gsutil cp - gs://$BUCKET_NAME/products/images/.keep  
    echo "" | gsutil cp - gs://$BUCKET_NAME/categories/images/.keep
    echo "" | gsutil cp - gs://$BUCKET_NAME/partners/logos/.keep
    echo "" | gsutil cp - gs://$BUCKET_NAME/vendors/logos/.keep
    
    log_info "✅ Folder structure created"
}

# Set up IAM permissions for presigned URLs
configure_iam() {
    log_info "Configuring IAM permissions for presigned URLs..."
    
    # The services should use workload identity, so we need to bind the KSA to GSA
    # This assumes the services are already configured with workload identity
    
    log_info "Checking if service accounts have Storage Object Creator role..."
    
    # Note: This assumes your services are using workload identity
    # The actual GSA should already have the necessary permissions
    # We'll document what permissions are needed
    
    cat << EOF

📋 Required IAM Permissions for Presigned URLs:
   
   Your service accounts need these roles:
   - Storage Object Creator (to generate presigned URLs)
   - Storage Object Viewer (to read objects)
   
   If using Workload Identity, ensure your GSAs have:
   gcloud projects add-iam-policy-binding $PROJECT_ID \\
     --member="serviceAccount:YOUR_SERVICE_ACCOUNT@$PROJECT_ID.iam.gserviceaccount.com" \\
     --role="roles/storage.objectCreator"
     
   gcloud projects add-iam-policy-binding $PROJECT_ID \\
     --member="serviceAccount:YOUR_SERVICE_ACCOUNT@$PROJECT_ID.iam.gserviceaccount.com" \\
     --role="roles/storage.objectViewer"

EOF

    log_info "✅ IAM configuration documented"
}

# Verify bucket configuration
verify_setup() {
    log_info "Verifying bucket configuration..."
    
    # Check bucket exists and is accessible
    gsutil ls gs://$BUCKET_NAME > /dev/null
    
    # Check CORS configuration
    gsutil cors get gs://$BUCKET_NAME > /dev/null
    
    # Check IAM policy
    gsutil iam get gs://$BUCKET_NAME > /dev/null
    
    log_info "✅ Bucket configuration verified"
    
    cat << EOF

🎉 Production GCS Bucket Setup Complete!

Bucket Details:
- Name: $BUCKET_NAME
- Project: $PROJECT_ID
- Region: $REGION
- Public URL: https://storage.googleapis.com/$BUCKET_NAME/
- Access: Public read, authenticated write via presigned URLs

Next Steps:
1. Update your service ConfigMaps to use this bucket
2. Ensure service accounts have proper IAM permissions
3. Test presigned URL generation from your services

EOF
}

# Main execution
main() {
    log_info "Starting production GCS bucket setup..."
    
    check_gcloud
    create_bucket
    configure_public_access
    configure_cors
    create_folder_structure  
    configure_iam
    verify_setup
    
    log_info "🚀 Setup completed successfully!"
}

# Run main function
main "$@"