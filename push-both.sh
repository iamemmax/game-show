#!/bin/bash

# Simple script to push to both repositories
# Usage: ./push-both.sh "Your commit message"

# Check if commit message is provided
if [ -z "$1" ]; then
  echo "Error: Commit message is required"
  echo "Usage: ./push-both.sh \"Your commit message\""
  exit 1
fi

COMMIT_MESSAGE="$1"

# Stage all changes
echo "Staging all changes..."
git add .

# Commit with the provided message
echo "Committing with message: \"$COMMIT_MESSAGE\""
git commit -m "$COMMIT_MESSAGE"

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch: $CURRENT_BRANCH"

# Push to both repositories
echo "Pushing to origin (LibertytechX/salary-life-game-hustlers)..."
git push origin $CURRENT_BRANCH

echo "Pushing to secondary (iamemmax/game-show)..."
git push secondary $CURRENT_BRANCH

echo "Push completed!"