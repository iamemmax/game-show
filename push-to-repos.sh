#!/bin/bash

# Script to push to two Git repositories simultaneously
# Usage: ./push-to-repos.sh "Commit message"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if commit message is provided
if [ -z "$1" ]; then
  echo -e "${RED}Error: Commit message is required${NC}"
  echo -e "Usage: ./push-to-repos.sh \"Your commit message\""
  exit 1
fi

COMMIT_MESSAGE="$1"

# Repository URLs - replace these with your actual repository URLs
PRIMARY_REPO="origin"
SECONDARY_REPO="secondary"

# Function to check if a remote exists
remote_exists() {
  git remote | grep -q "^$1$"
  return $?
}

# Function to add a remote if it doesn't exist
add_remote_if_needed() {
  if ! remote_exists "$1"; then
    echo -e "${YELLOW}Remote '$1' does not exist. Please enter the URL:${NC}"
    read -p "URL for $1: " REMOTE_URL
    git remote add "$1" "$REMOTE_URL"
    echo -e "${GREEN}Added remote '$1'${NC}"
  fi
}

# Check if both remotes exist, add if needed
add_remote_if_needed "$PRIMARY_REPO"
add_remote_if_needed "$SECONDARY_REPO"

# Stage all changes
echo -e "${YELLOW}Staging all changes...${NC}"
git add .

# Commit changes
echo -e "${YELLOW}Committing with message: ${NC}\"$COMMIT_MESSAGE\""
git commit -m "$COMMIT_MESSAGE"

# Push to primary repository
echo -e "${YELLOW}Pushing to $PRIMARY_REPO...${NC}"
git push "$PRIMARY_REPO" $(git branch --show-current)
PRIMARY_STATUS=$?

# Push to secondary repository
echo -e "${YELLOW}Pushing to $SECONDARY_REPO...${NC}"
git push "$SECONDARY_REPO" $(git branch --show-current)
SECONDARY_STATUS=$?

# Check if both pushes were successful
if [ $PRIMARY_STATUS -eq 0 ] && [ $SECONDARY_STATUS -eq 0 ]; then
  echo -e "${GREEN}Successfully pushed to both repositories!${NC}"
else
  echo -e "${RED}There were issues pushing to one or both repositories.${NC}"
  [ $PRIMARY_STATUS -ne 0 ] && echo -e "${RED}Failed to push to $PRIMARY_REPO${NC}"
  [ $SECONDARY_STATUS -ne 0 ] && echo -e "${RED}Failed to push to $SECONDARY_REPO${NC}"
  exit 1
fi