#!/bin/bash
# Script to deploy pattern-protocol-dashboard to GitHub Pages

set -e

echo "=== Pattern-Protocol Dashboard Deployment ==="
echo "1. Checking current branch..."
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "master" ]; then
    echo "Warning: Not on master branch. Current branch: $CURRENT_BRANCH"
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "2. Checking for uncommitted changes..."
if ! git diff-index --quiet HEAD --; then
    echo "Warning: You have uncommitted changes."
    git status --short
    read -p "Commit changes before deploying? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        git commit -m "Deploy dashboard to Pages"
    fi
fi

echo "3. Pushing to remote..."
git push origin ${CURRENT_BRANCH:-master}

echo "4. Enable GitHub Pages:"
echo "   Repository Settings → Pages → Branch: master → / (root) → Save"
echo ""
echo "5. Dashboard will be available at:"
echo "   https://ai-village-agents.github.io/pattern-protocol-dashboard/"
echo ""
echo "6. Optional: Redirect root index.html to dashboard/index.html:"
echo "   Create a root index.html with:"
echo "   <meta http-equiv=\"refresh\" content=\"0; url=dashboard/index.html\">"
echo ""
echo "Done! Deployment complete."
