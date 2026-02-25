# Getting Started

## 🚀 Direct GitHub Actions Deployment

**Successfully migrated from GitOps to direct deployment!**

- ✅ Faster deployment (no GitOps reconciliation delay)
- ✅ Better visibility (all logs in GitHub Actions)
- ✅ Simplified architecture (no separate k8s repo)
- ✅ Fixed CalVer tag generation with conflict resolution
- ✅ Simplified deployment logic matching product-service pattern

## Development

To start the development server:

```bash
npm run dev
```

## Production Build

To build the project for production:

```bash
npm run build
```

## Docker Build & Deploy

To build the Docker image:

```bash
docker build -t admin-ui .
```

To run the Docker container:

```bash
docker run -p 3000:3000 admin-ui
```

## API Endpoints

### Health Check

- **GET** `/api/health` - Basic health check endpoint

### Test Endpoint (CI/CD Testing)

- **GET** `/api/test` - Returns build information and CI/CD pipeline status
- Response includes:
  - Build timestamp
  - Version information
  - Commit SHA
  - Pipeline status
  - Environment details
  - **Test Build**: v2-org-wide-auth ✅

## CI/CD Pipeline

The project uses GitHub Actions for automated builds:

- **Development Branch**: Builds `admin-ui-dev:latest` images
- **Main Branch**: Builds `admin-ui-stg` images with CalVer tagging
- **Artifact Registry**: Images pushed to Google Artifact Registry

### Testing the Pipeline

1. Create feature branch from `develop`
2. Make changes and push
3. Create PR to `develop` branch
4. Merge PR to trigger development build

🧪 Test public workflow templates
🔧 Test Docker buildx fix

🚀 Test staging deployment - Sat Jun 28 08:29:29 IST 2025

# Test deployment Mon Jun 30 11:16:37 IST 2025

Testing CalVer fix - Mon Jun 30 12:44:50 IST 2025
