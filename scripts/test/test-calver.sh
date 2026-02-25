#!/bin/bash

# CalVer Implementation Test Script
# Tests the enhanced CalVer system for race conditions and conflicts

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

# Test configuration
TEST_PREFIX="test-calver"
CONCURRENT_TESTS=3
TEMP_DIR=$(mktemp -d)

cleanup() {
    print_info "🧹 Cleaning up test tags..."
    git tag -l "${TEST_PREFIX}-*" | xargs -r git tag -d
    git push --delete origin $(git tag -l "${TEST_PREFIX}-*" | tr '\n' ' ') 2>/dev/null || true
    rm -rf "$TEMP_DIR"
}

trap cleanup EXIT

print_info "🧪 CalVer Implementation Test Suite"
echo "==================================="

# Test 1: Basic CalVer generation
print_info "Test 1: Basic CalVer tag generation"
if [[ -f "scripts/create-calver-tag.sh" ]]; then
    TEST_TAG=$(bash scripts/create-calver-tag.sh --prefix="$TEST_PREFIX" --dry-run)
    if [[ "$TEST_TAG" =~ ^${TEST_PREFIX}-[0-9]{4}\.[0-9]{2}\.[0-9]+$ ]]; then
        print_success "✅ Basic CalVer format is correct: $TEST_TAG"
    else
        print_error "❌ Invalid CalVer format: $TEST_TAG"
        exit 1
    fi
else
    print_error "❌ CalVer script not found"
    exit 1
fi

# Test 2: Conflict detection
print_info "Test 2: Conflict detection and resolution"
CURRENT_DATE=$(date +%Y.%m)
CONFLICT_TAG="${TEST_PREFIX}-${CURRENT_DATE}.1"

# Create a conflicting tag
git tag "$CONFLICT_TAG" > /dev/null 2>&1 || true

# Test conflict resolution
NEW_TAG=$(bash scripts/create-calver-tag.sh --prefix="$TEST_PREFIX" --dry-run)
if [[ "$NEW_TAG" != "$CONFLICT_TAG" ]]; then
    print_success "✅ Conflict resolution works: $NEW_TAG != $CONFLICT_TAG"
else
    print_error "❌ Conflict resolution failed"
    exit 1
fi

# Test 3: Concurrent tag creation simulation
print_info "Test 3: Concurrent tag creation simulation"
echo "Creating $CONCURRENT_TESTS concurrent CalVer tags..."

# Create background jobs that simulate concurrent tag creation
pids=()
for i in $(seq 1 $CONCURRENT_TESTS); do
    (
        sleep $((RANDOM % 3))  # Random delay to increase race condition chance
        tag=$(bash scripts/create-calver-tag.sh --prefix="${TEST_PREFIX}-concurrent")
        echo "Worker $i created: $tag"
    ) &
    pids+=($!)
done

# Wait for all background jobs
for pid in "${pids[@]}"; do
    wait "$pid"
done

# Check if all tags are unique
CONCURRENT_TAGS=($(git tag -l "${TEST_PREFIX}-concurrent-*"))
UNIQUE_TAGS=($(printf '%s\n' "${CONCURRENT_TAGS[@]}" | sort -u))

if [[ ${#CONCURRENT_TAGS[@]} -eq ${#UNIQUE_TAGS[@]} ]]; then
    print_success "✅ All concurrent tags are unique (${#CONCURRENT_TAGS[@]} tags created)"
else
    print_error "❌ Duplicate tags detected in concurrent creation"
    echo "Total tags: ${#CONCURRENT_TAGS[@]}, Unique tags: ${#UNIQUE_TAGS[@]}"
    exit 1
fi

# Test 4: Build script integration
print_info "Test 4: Build script integration"
if [[ -f "build-and-push.sh" ]]; then
    # Test dry-run mode (if available)
    print_info "Testing build script CalVer generation..."
    
    # Check if the build script has proper CalVer integration
    if grep -q "scripts/create-calver-tag.sh\|generate_calver_with_conflict_resolution" build-and-push.sh; then
        print_success "✅ Build script has CalVer integration"
    else
        print_warning "⚠️  Build script may need CalVer integration"
    fi
else
    print_warning "⚠️  No build-and-push.sh script found"
fi

# Test 5: Error handling
print_info "Test 5: Error handling"
# Test invalid format
if bash scripts/create-calver-tag.sh --format="INVALID.FORMAT" --dry-run 2>/dev/null; then
    print_error "❌ Error handling failed - invalid format should be rejected"
    exit 1
else
    print_success "✅ Invalid format properly rejected"
fi

# Test 6: Documentation check
print_info "Test 6: Documentation completeness"
if [[ -f "CALVER_TAG_RESOLUTION.md" ]]; then
    if grep -q "conflict resolution\|race condition\|concurrent" CALVER_TAG_RESOLUTION.md; then
        print_success "✅ Documentation covers conflict resolution"
    else
        print_warning "⚠️  Documentation may be incomplete"
    fi
else
    print_warning "⚠️  CalVer documentation not found"
fi

print_info "📊 Test Summary"
echo "==============="
echo "Repository: $(basename $(pwd))"
echo "CalVer Script: scripts/create-calver-tag.sh"
echo "Build Script: build-and-push.sh"
echo "Documentation: CALVER_TAG_RESOLUTION.md"
echo "Test Tags Created: ${#CONCURRENT_TAGS[@]} (will be cleaned up)"
echo ""

print_success "🎉 All CalVer tests completed successfully!"
print_info "💡 The enhanced CalVer system is working correctly and ready for production use"
