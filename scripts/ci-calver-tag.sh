#!/bin/bash

# Simple CalVer tag generator for CI/CD
# This script handles the exact case you encountered where v25.06.1 already exists

set -e

# Fetch all tags first (critical in CI environments)
echo "Fetching all remote tags..."
git fetch --tags --force origin 2>/dev/null || git fetch --tags origin || true

# Generate CalVer format: YY.MM.PATCH (e.g., 25.06.1)
YEAR=$(date +%y)
MONTH=$(date +%m)

echo "Looking for existing tags for ${YEAR}.${MONTH}.*"

# Get ALL tags for this year.month pattern from both local and remote
# First get local tags
LOCAL_TAGS=$(git tag -l "v${YEAR}.${MONTH}.*" 2>/dev/null || echo "")

# Then get remote tags to ensure we don't miss any
REMOTE_TAGS=$(git ls-remote --tags origin 2>/dev/null | \
              grep "refs/tags/v${YEAR}\.${MONTH}\." | \
              sed 's|.*refs/tags/||' || echo "")

# Combine and sort all tags
ALL_TAGS=$(printf "%s\n%s" "$LOCAL_TAGS" "$REMOTE_TAGS" | \
           grep -E "^v${YEAR}\.${MONTH}\.[0-9]+$" | \
           sort -u | \
           sort -V)

echo "Found existing tags: $ALL_TAGS"

if [ -z "$ALL_TAGS" ]; then
  # No previous tag for this year.month, start with patch 1
  PATCH=1
  echo "No existing tags found, starting with patch 1"
else
  # Find the highest patch number
  HIGHEST_PATCH=$(echo "$ALL_TAGS" | \
                 sed "s/v${YEAR}\.${MONTH}\.//" | \
                 sort -n | \
                 tail -1)
  PATCH=$((HIGHEST_PATCH + 1))
  echo "Highest existing patch: $HIGHEST_PATCH, using patch: $PATCH"
fi

VERSION="${YEAR}.${MONTH}.${PATCH}"
FULL_TAG="v${VERSION}"

echo "Generated version: ${FULL_TAG}"

# Double-check the tag doesn't exist before we try to create it
if git tag -l "$FULL_TAG" | grep -q "^${FULL_TAG}$" 2>/dev/null; then
    echo "ERROR: Tag $FULL_TAG exists locally!"
    exit 1
fi

if git ls-remote --tags origin 2>/dev/null | grep -q "refs/tags/${FULL_TAG}$"; then
    echo "ERROR: Tag $FULL_TAG exists on remote!"
    exit 1
fi

# Output for GitHub Actions
if [ -n "${GITHUB_OUTPUT:-}" ]; then
    echo "version=${VERSION}" >> $GITHUB_OUTPUT
    echo "full_tag=${FULL_TAG}" >> $GITHUB_OUTPUT
    echo "calver_tag=${VERSION}" >> $GITHUB_OUTPUT
fi

# Output for shell capture
echo "VERSION=${VERSION}"
echo "FULL_TAG=${FULL_TAG}"

# If we're actually in CI, create and push the tag
if [ "${CI:-}" = "true" ] || [ "${GITHUB_ACTIONS:-}" = "true" ]; then
    echo "Creating and pushing tag: $FULL_TAG"
    git tag "$FULL_TAG"
    git push origin "$FULL_TAG"
    echo "Successfully created and pushed tag: $FULL_TAG"
else
    echo "Not in CI environment, tag not created automatically"
    echo "To create manually, run: git tag $FULL_TAG && git push origin $FULL_TAG"
fi
