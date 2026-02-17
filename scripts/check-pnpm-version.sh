#!/bin/bash

# Extract pnpm version from package.json
PACKAGE_JSON_VERSION=$(grep -o '"packageManager":\s*"pnpm@[^\"]*"' package.json | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+')

# Extract pnpm version from workflow files
WORKFLOW_VERSIONS=$(grep -r "pnpm/action-setup" .github/workflows/ -A 3 | grep "version:" | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+' | sort -u)

if [ -z "$PACKAGE_JSON_VERSION" ]; then
  echo "❌ Error: Could not find packageManager version in package.json"
  exit 1
fi

echo "📦 package.json pnpm version: $PACKAGE_JSON_VERSION"

# Check each workflow version
HAS_MISMATCH=false
while IFS= read -r WORKFLOW_VERSION; do
  if [ "$WORKFLOW_VERSION" != "$PACKAGE_JSON_VERSION" ]; then
    echo "❌ Mismatch: Workflow uses pnpm $WORKFLOW_VERSION, but package.json uses $PACKAGE_JSON_VERSION"
    HAS_MISMATCH=true
  else
    echo "✅ Workflow version matches: $WORKFLOW_VERSION"
  fi
done <<< "$WORKFLOW_VERSIONS"

if [ "$HAS_MISMATCH" = true ]; then
  echo ""
  echo "🔧 Fix: Update .github/workflows/*.yml to use version: $PACKAGE_JSON_VERSION"
  exit 1
fi

echo "✅ All pnpm versions are consistent!"
exit 0
