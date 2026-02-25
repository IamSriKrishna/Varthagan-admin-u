#!/bin/bash

# CalVer Migration Guide and Checklist
# Use this script to migrate other microservices to the enhanced CalVer system

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

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "This script must be run in a git repository"
    exit 1
fi

REPO_ROOT=$(git rev-parse --show-toplevel)
REPO_NAME=$(basename "$REPO_ROOT")

print_info "🔄 CalVer Migration Guide for: $REPO_NAME"
echo "=================================="

# Check current CalVer implementation
print_info "📋 Checking current CalVer implementation..."

# 1. Check for existing CalVer scripts
if [[ -f "scripts/create-calver-tag.sh" ]]; then
    print_success "✅ Enhanced CalVer script already exists"
else
    print_warning "⚠️  Enhanced CalVer script missing"
    echo "   Action: Copy scripts/create-calver-tag.sh from admin-ui"
fi

# 2. Check build scripts
BUILD_SCRIPTS=("build-and-push.sh" "scripts/build-and-push.sh")
for script in "${BUILD_SCRIPTS[@]}"; do
    if [[ -f "$script" ]]; then
        if grep -q "generate_calver_with_conflict_resolution\|scripts/create-calver-tag.sh" "$script"; then
            print_success "✅ $script uses enhanced CalVer logic"
        else
            print_warning "⚠️  $script needs CalVer update"
            echo "   Action: Update $script to use enhanced CalVer logic"
        fi
    fi
done

# 3. Check for legacy CalVer implementations
LEGACY_PATTERNS=("git tag.*CALVER\|CalVer\|calver" "date.*tag" "VERSION.*git tag")
for pattern in "${LEGACY_PATTERNS[@]}"; do
    if grep -r -E "$pattern" --include="*.sh" --include="*.yml" --include="*.yaml" . 2>/dev/null | grep -v "create-calver-tag.sh" | grep -v "CALVER_TAG_RESOLUTION.md" | grep -q .; then
        print_warning "⚠️  Potential legacy CalVer implementations found:"
        grep -r -E "$pattern" --include="*.sh" --include="*.yml" --include="*.yaml" . 2>/dev/null | grep -v "create-calver-tag.sh" | grep -v "CALVER_TAG_RESOLUTION.md" | head -5
        echo "   Action: Review and update these implementations"
    fi
done

# 4. Check GitHub workflows
if [[ -d ".github/workflows" ]]; then
    WORKFLOW_FILES=(.github/workflows/*.yml .github/workflows/*.yaml)
    for workflow in "${WORKFLOW_FILES[@]}"; do
        if [[ -f "$workflow" ]]; then
            if grep -q "release-build\|development-build" "$workflow"; then
                print_info "📝 $workflow uses reusable workflow templates"
                echo "   Note: CalVer logic should be in the template repository"
            fi
        fi
    done
fi

# 5. Check documentation
if [[ -f "CALVER_TAG_RESOLUTION.md" ]]; then
    print_success "✅ CalVer documentation exists"
else
    print_warning "⚠️  CalVer documentation missing"
    echo "   Action: Copy CALVER_TAG_RESOLUTION.md from admin-ui"
fi

echo ""
print_info "🚀 Migration Steps:"
echo "=================="
echo "1. Copy enhanced CalVer script:"
echo "   cp /path/to/admin-ui/scripts/create-calver-tag.sh scripts/"
echo ""
echo "2. Update build scripts to use enhanced CalVer:"
echo "   - Replace legacy CalVer logic with calls to scripts/create-calver-tag.sh"
echo "   - Add fallback function for backwards compatibility"
echo ""
echo "3. Remove legacy CalVer implementations:"
echo "   - Clean up old CalVer generation code"
echo "   - Remove duplicate scripts if any"
echo ""
echo "4. Copy documentation:"
echo "   cp /path/to/admin-ui/CALVER_TAG_RESOLUTION.md ."
echo ""
echo "5. Test the migration:"
echo "   - Run build scripts in dry-run mode"
echo "   - Verify no CalVer conflicts occur"
echo "   - Test concurrent builds if possible"
echo ""

print_info "📚 Additional Resources:"
echo "======================="
echo "- CalVer Specification: https://calver.org/"
echo "- Enhanced CalVer Documentation: CALVER_TAG_RESOLUTION.md"
echo "- Standalone CalVer Script: scripts/create-calver-tag.sh"
echo ""

print_success "✅ Migration guide completed!"
print_info "💡 For questions or issues, refer to the admin-ui implementation as reference"
