#!/bin/bash

# Simple script to automate Git workflow
# Usage: ./git-update.sh "Your commit message"

# Check if a commit message was provided
if [ -z "$1" ]; then
  echo "Error: Please provide a commit message."
  echo "Usage: ./git-update.sh \"Your commit message\""
  exit 1
fi

# Store the commit message
COMMIT_MESSAGE="$1"

# Print status before changes
echo "📊 Current Git Status:"
git status

# Stage all changes
echo "📦 Staging changes..."
git add .

# Commit changes with the provided message
echo "💾 Committing changes: $COMMIT_MESSAGE"
git commit -m "$COMMIT_MESSAGE"

# Push changes to GitHub
echo "🚀 Pushing to GitHub..."
git push

# Print final status
echo "✅ Done! Final status:"
git status

echo "🎉 Your changes have been pushed to GitHub!"
