# Updated CI/CD Pipeline Logic

## 🎯 **Branch-Based Image Naming Strategy**

### **Main Branch (Staging Environment)**

- **Image Name**: `admin-ui-stg`
- **Tagging Strategy**: CalVer format (`YY.MM.PATCH`)
- **Tags Produced**:
  - `admin-ui-stg:25.06.0` (CalVer)
  - `admin-ui-stg:latest`
- **Environment**: Staging
- **Git Tags**: Creates CalVer git tags automatically

### **Develop Branch (Development Environment)**

- **Image Name**: `admin-ui-dev`
- **Tagging Strategy**: Simple `latest` tag (no versioning)
- **Tags Produced**:
  - `admin-ui-dev:latest`
- **Environment**: Development
- **Git Tags**: No git tags created

## 🏗️ **Updated Pipeline Architecture**

### **Release Pipeline (main → staging)**

```
PR Merge to main → CalVer Tag → Build admin-ui-stg → Push with CalVer + latest
```

### **Development Pipeline (develop → dev)**

```
Push to develop → Build admin-ui-dev → Push with latest tag only
```

## 📦 **Image Examples**

### **Staging Images (from main branch)**

```bash
asia-south1-docker.pkg.dev/bb-app-461714/bbapp/admin-ui-stg:25.06.0
asia-south1-docker.pkg.dev/bb-app-461714/bbapp/admin-ui-stg:latest
```

### **Development Images (from develop branch)**

```bash
asia-south1-docker.pkg.dev/bb-app-461714/bbapp/admin-ui-dev:latest
```

## 🔄 **Workflow Differences**

| Aspect          | Main Branch (Staging) | Develop Branch (Development) |
| --------------- | --------------------- | ---------------------------- |
| **Image Name**  | `admin-ui-stg`        | `admin-ui-dev`               |
| **Versioning**  | CalVer (25.06.0)      | No versioning                |
| **Git Tags**    | ✅ Created            | ❌ Not created               |
| **Tags Count**  | 2 (CalVer + latest)   | 1 (latest only)              |
| **Environment** | Staging               | Development                  |
| **Stability**   | Stable releases       | Rapid iteration              |

## 🎯 **Benefits of This Approach**

### **Clear Environment Separation**

- ✅ **Staging**: Stable, versioned releases for testing before production
- ✅ **Development**: Rapid iteration without version noise

### **Simplified Development Workflow**

- ✅ **No version management** on development
- ✅ **Always latest** for continuous development
- ✅ **No git tag pollution** from development builds

### **Production-Ready Staging**

- ✅ **CalVer versioning** for staging releases
- ✅ **Git tags** for release tracking
- ✅ **Rollback capability** via version tags

## 🚀 **Deployment Strategy**

### **Development Environment**

```yaml
# Always uses latest development image
image: asia-south1-docker.pkg.dev/bb-app-461714/bbapp/admin-ui-dev:latest
```

### **Staging Environment**

```yaml
# Uses specific CalVer version for stability
image: asia-south1-docker.pkg.dev/bb-app-461714/bbapp/admin-ui-stg:25.06.0
```

### **Production Environment**

```yaml
# Promotes from staging after testing
image: asia-south1-docker.pkg.dev/bb-app-461714/bbapp/admin-ui-stg:25.06.0
```

## 📋 **Next Steps for GitOps (Task 4)**

With this new image naming strategy, the GitOps automation should:

1. **Development Updates**: Update K8s manifests to use `admin-ui-dev:latest`
2. **Staging Updates**: Update K8s manifests to use specific CalVer tags like `admin-ui-stg:25.06.0`
3. **Environment-Specific**: Different manifest updates based on branch

This approach provides clear separation between rapid development iterations and stable staging releases, making it easier to manage deployments across environments.
