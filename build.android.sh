#!/bin/bash

# eT Chat - Android APK Build Script
# This script builds the Android APK with all necessary dependencies

set -e

echo "========================================"
echo "eT Chat - Android APK Build"
echo "========================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Build web assets
echo -e "${YELLOW}[1/5]${NC} Building web assets..."
npm run build
echo -e "${GREEN}✓ Web build completed${NC}"

# Step 2: Sync Capacitor
echo -e "${YELLOW}[2/5]${NC} Syncing Capacitor..."
npx cap sync android
echo -e "${GREEN}✓ Capacitor synced${NC}"

# Step 3: Build Android APK
echo -e "${YELLOW}[3/5]${NC} Building Android APK..."
cd android
./gradlew build
echo -e "${GREEN}✓ Android APK built${NC}"

# Step 4: List output files
echo -e "${YELLOW}[4/5]${NC} Built APK locations:"
find . -name "*.apk" -type f
echo -e "${GREEN}✓ APK files located${NC}"

# Step 5: Success message
echo ""
echo -e "${GREEN}========================================"
echo "✓ Build Complete!"
echo "========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Install APK on device: adb install build/outputs/apk/debug/app-debug.apk"
echo "2. Or for release: adb install build/outputs/apk/release/app-release.apk"
echo ""
echo "To create a release APK, ensure you have:"
echo "- Signed your application keystore"
echo "- Updated version in build.gradle"
