# BBApp Admin UI - CalVer Versioning Strategy

## 📅 **Calendar Versioning (CalVer) Format: YYYY.MM.MICRO**

### **Why CalVer over SemVer?**

✅ **Perfect for time-based releases**: Bi-weekly staging releases  
✅ **No semantic decisions needed**: Just increment within the month  
✅ **Clear release timeline**: Easy to see when version was released  
✅ **Automated increment**: No human judgment required for version bumps

## 🏷️ **Version Examples**

### **Staging Releases (CalVer)**

- `2025.06.1` - First staging release in June 2025
- `2025.06.2` - Second staging release in June 2025
- `2025.07.1` - First staging release in July 2025

### **Development Builds (Timestamp)**

- `2025.06-dev.20250623-143022.abc1234`
- `2025.06-dev.20250623-160545.def5678`

## 🔄 **Automatic Versioning Logic**

### **For Staging (`./build-and-push.sh stg`)**

1. Get current date: `2025.06`
2. Find latest tag for current month: `git tag -l "2025.06.*"`
3. Extract micro version and increment: `2025.06.1` → `2025.06.2`
4. If no tags for current month: Start with `2025.06.1`

### **For Development (`./build-and-push.sh dev`)**

1. Use current date + timestamp + commit hash
2. Format: `YYYY.MM-dev.YYYYMMDD-HHMMSS.{commit-hash}`
3. No git tags created (keeps repo clean)

## 📊 **Release Cadence**

### **Staging Releases (Bi-weekly)**

- **June 2025**: `2025.06.1`, `2025.06.2`
- **July 2025**: `2025.07.1`, `2025.07.2`
- **August 2025**: `2025.08.1`, `2025.08.2`

### **Development Releases (Multiple per day)**

- No version constraints
- Timestamp-based for uniqueness
- Easy cleanup of old dev images

## 🎯 **Migration from SemVer**

If you had existing SemVer tags like `v1.2.3`, they will be ignored by the CalVer logic. The system will start fresh with the current month's CalVer format.

## 🚀 **Usage Examples**

```bash
# Staging release - creates 2025.06.3
./build-and-push.sh stg

# Development build - creates 2025.06-dev.20250623-143022.abc1234
./build-and-push.sh dev

# Deploy latest staging CalVer
./deploy-gke.sh stg

# Deploy specific CalVer version
./deploy-gke.sh stg 2025.06.2
```

## ✅ **Benefits for BBApp**

1. **Predictable versioning**: Know exactly when each release was made
2. **No version conflicts**: Each month starts fresh with `.1`
3. **Easy automation**: No human decisions needed for version increments
4. **Clear progression**: `2025.06.1` → `2025.06.2` is obviously newer
5. **Bi-weekly rhythm**: Perfect for your release schedule

CalVer is ideal for your deployment strategy! 🎉
