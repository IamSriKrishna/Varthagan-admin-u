#!/bin/bash

# Production GCS Bucket Setup Script
# Creates bucket for media uploads in production environment

set -e

# Configuration
PROJECT_ID="light-depot-471209-j7"
BUCKET_NAME="prod-media-bbapp-light-depot-471209-j7"
REGION="asia-south1"
SERVICE_ACCOUNT_EMAIL="admin-role@${PROJECT_ID}.iam.gserviceaccount.com"

echo "🚀 Setting up production GCS bucket: ${BUCKET_NAME}"

# Set the project context
echo "📋 Setting project context to: ${PROJECT_ID}"
gcloud config set project ${PROJECT_ID}

# Create bucket if it doesn't exist
if gsutil ls gs://${BUCKET_NAME} >/dev/null 2>&1; then
    echo "✅ Bucket ${BUCKET_NAME} already exists"
else
    echo "🪣 Creating bucket: ${BUCKET_NAME}"
    gsutil mb -p ${PROJECT_ID} -c STANDARD -l ${REGION} gs://${BUCKET_NAME}
fi

# Set bucket to public read access
echo "🔓 Setting public read access for bucket"
gsutil iam ch allUsers:objectViewer gs://${BUCKET_NAME}

# Configure CORS for web uploads
echo "🌐 Configuring CORS policy"
cat << EOF > /tmp/cors.json
[
  {
    "origin": ["https://admin.bbapp.in", "https://dev-admin.bbcloud.app"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"],
    "maxAgeSeconds": 3600
  }
]
EOF

gsutil cors set /tmp/cors.json gs://${BUCKET_NAME}
rm /tmp/cors.json

# Set up IAM permissions for service account to generate presigned URLs
echo "🔑 Setting up IAM permissions for presigned URLs"
gsutil iam ch serviceAccount:${SERVICE_ACCOUNT_EMAIL}:objectAdmin gs://${BUCKET_NAME}

# Verify bucket configuration
echo "🔍 Verifying bucket configuration:"
echo "📊 Bucket info:"
gsutil ls -L -b gs://${BUCKET_NAME} | grep -E "(Location|Storage class|Public access)"

echo "🌐 CORS configuration:"
gsutil cors get gs://${BUCKET_NAME}

echo "🔑 IAM policy:"
gsutil iam get gs://${BUCKET_NAME} | grep -A 3 -B 3 ${SERVICE_ACCOUNT_EMAIL} || echo "Service account permissions may need verification"

echo ""
echo "✅ Production GCS bucket setup complete!"
echo "📝 Bucket name: ${BUCKET_NAME}"
echo "🌍 Public URL base: https://storage.googleapis.com/${BUCKET_NAME}/"
echo "🔐 Service account for presigned URLs: ${SERVICE_ACCOUNT_EMAIL}"
echo ""
echo "Next steps:"
echo "1. Update service ConfigMaps with GCS_BUCKET_NAME"
echo "2. Test presigned URL generation from customer/product services"