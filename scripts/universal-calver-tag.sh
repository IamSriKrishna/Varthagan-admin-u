#!/bin/bash

# Universal CalVer Tag Generator for Workflow Templates
# This script can be used across all repositories in your organization
# Handles all edge cases and conflicts automatically

set -e

# Logging functions for CI compatibility - no colors to avoid parsing issues
log_info() { echo "[INFO] $1" >&2; }
log_success() { echo "[SUCCESS] $1" >&2; }
log_warning() { echo "[WARNING] $1" >&2; }
log_error() { echo "[ERROR] $1" >&2; }

# Configuration
PREFIX="v"
FORMAT="YY.MM.PATCH"  # e.g., v25.06.1

log_info "Universal CalVer Tag Generator"
log_info "Format: $FORMAT, Prefix: $PREFIX"

# Ensure we're in a git repository
if ! git rev-parse --git-dir >/dev/null 2>&1; then
    log_error "Not in a git repository"
    exit 1
fi

# Configure git user for CI (GitHub Actions, Cloud Build, etc.)
if ! git config user.name >/dev/null 2>&1; then
    log_info "Configuring git user for CI environment"
    git config user.name "github-actions[bot]"
    git config user.email "github-actions[bot]@users.noreply.github.com"
fi

# Get current date components
YEAR=$(date +%y)
MONTH=$(date +%m)
YEAR_MONTH="${YEAR}.${MONTH}"

log_info "Current period: $YEAR_MONTH"

# Critical: Fetch ALL remote tags first (this is what was missing!)
log_info "Fetching all remote tags (critical for CI environments)..."
git fetch --tags --force origin 2>/dev/null || git fetch --tags origin 2>/dev/null || {
    log_warning "Failed to fetch remote tags, continuing with local tags only"
}

# Find ALL existing tags for this year.month pattern
PATTERN="${PREFIX}${YEAR_MONTH}.*"
log_info "Searching for existing tags with pattern: $PATTERN"

# Get local tags
LOCAL_TAGS=$(git tag -l "$PATTERN" 2>/dev/null || echo "")

# Get remote tags (critical for distributed CI environments)
REMOTE_TAGS=""
if git remote get-url origin >/dev/null 2>&1; then
    REMOTE_TAGS=$(git ls-remote --tags origin 2>/dev/null | \
                  grep "refs/tags/${PREFIX}${YEAR_MONTH}\." | \
                  sed 's|.*refs/tags/||' 2>/dev/null || echo "")
fi

# Combine and deduplicate all tags
ALL_TAGS=$(printf "%s\n%s" "$LOCAL_TAGS" "$REMOTE_TAGS" | \
           grep -E "^${PREFIX}${YEAR_MONTH}\.[0-9]+$" | \
           sort -u | \
           grep -v '^$' || echo "")

# Find the highest patch number
HIGHEST_PATCH=0
if [[ -n "$ALL_TAGS" ]]; then
    log_info "Found existing tags for $YEAR_MONTH"
    # Log each tag individually to avoid output formatting issues
    while read -r tag; do
        [[ -n "$tag" ]] && log_info "Existing tag: $tag"
    done <<< "$ALL_TAGS"
    
    # Extract patch numbers and find the highest
    while read -r tag; do
        if [[ -n "$tag" && "$tag" =~ ^${PREFIX}${YEAR_MONTH}\.([0-9]+)$ ]]; then
            PATCH="${BASH_REMATCH[1]}"
            if [[ "$PATCH" -gt "$HIGHEST_PATCH" ]]; then
                HIGHEST_PATCH="$PATCH"
            fi
        fi
    done <<< "$ALL_TAGS"
    
    log_info "Highest existing patch: $HIGHEST_PATCH"
else
    log_info "No existing tags found for $YEAR_MONTH"
fi

# Generate next patch number
NEXT_PATCH=$((HIGHEST_PATCH + 1))
NEW_TAG="${PREFIX}${YEAR_MONTH}.${NEXT_PATCH}"

log_success "Generated new tag: $NEW_TAG"

# Safety check: Double-verify the tag doesn't exist
if git tag -l "$NEW_TAG" | grep -q "^${NEW_TAG}$" 2>/dev/null; then
    log_error "Tag $NEW_TAG already exists locally! This shouldn't happen."
    exit 1
fi

if git remote get-url origin >/dev/null 2>&1; then
    if git ls-remote --tags origin 2>/dev/null | grep -q "refs/tags/${NEW_TAG}$"; then
        log_error "Tag $NEW_TAG already exists on remote! This shouldn't happen."
        exit 1
    fi
fi

# Create the tag
log_info "Creating local tag: $NEW_TAG"
if ! git tag "$NEW_TAG" -m "Release $NEW_TAG [skip ci]"; then
    log_error "Failed to create tag: $NEW_TAG"
    exit 1
fi

log_success "Created local tag: $NEW_TAG"

# Push to remote
if git remote get-url origin >/dev/null 2>&1; then
    log_info "Pushing tag to remote: $NEW_TAG"
    if git push origin "$NEW_TAG" 2>/dev/null; then
        log_success "Successfully pushed tag to remote: $NEW_TAG"
    else
        log_error "Failed to push tag to remote"
        # Clean up local tag on failure
        git tag -d "$NEW_TAG" 2>/dev/null || true
        exit 1
    fi
else
    log_warning "No remote origin configured - tag created locally only"
fi

# Export for GitHub Actions
if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
    VERSION_WITHOUT_PREFIX="${NEW_TAG#$PREFIX}"
    echo "version=${VERSION_WITHOUT_PREFIX}" >> "$GITHUB_OUTPUT"
    echo "full_tag=${NEW_TAG}" >> "$GITHUB_OUTPUT"
    echo "calver_tag=${NEW_TAG}" >> "$GITHUB_OUTPUT"
    log_info "Exported variables to GITHUB_OUTPUT"
fi

# Export for Cloud Build
if [[ -n "${BUILD_ID:-}" ]]; then
    echo "$NEW_TAG" > /workspace/version_tag.txt
    log_info "Exported tag to /workspace/version_tag.txt for Cloud Build"
fi

# Output the tag for script capture
echo "$NEW_TAG"
log_success "CalVer tag creation completed successfully!"

# Exit with success
exit 0
