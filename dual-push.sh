#!/bin/bash

# Simple script to push to two Git repositories
# Usage: ./dual-push.sh "Commit message"

# Check if commit message is provided
if [ -z "$1" ]; then
  echo "Error: Commit message is required"
  echo "Usage: ./dual-push.sh \"Your commit message\""
  exit 1
fi

COMMIT_MESSAGE="$1"

# Make sure both remotes exist
if ! git remote | grep -q "^origin$"; then
  echo "Error: 'origin' remote does not exist"
  exit 1
fi

if ! git remote | grep -q "^secondary$"; then
  echo "Please enter the URL for the secondary repository:"
  read SECONDARY_URL
  git remote add secondary "$SECONDARY_URL"
  echo "Added secondary remote"
fi

# Stage and commit
git add .
git commit -m "$COMMIT_MESSAGE"

# Get current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Push to both repositories
echo "Pushing to origin..."
git push origin "$BRANCH"

echo "Pushing to secondary..."
git push secondary "$BRANCH"

echo "Done!"