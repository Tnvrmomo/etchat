#!/bin/bash
set -e

echo "================================"
echo "etChat Android APK Builder"
echo "================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    SDK_URL="https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip"
    NDK_URL="https://dl.google.com/android/repository/android-ndk-r25c-linux.zip"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    SDK_URL="https://dl.google.com/android/repository/commandlinetools-mac-9477386_latest.zip"
    NDK_URL="https://dl.google.com/android/repository/android-ndk-r25c-darwin.zip"
else
    echo -e "${RED}Unsupported OS: $OSTYPE${NC}"
    exit 1
fi

ANDROID_HOME="${ANDROID_HOME:=$HOME/Android/Sdk}"
export ANDROID_HOME

echo -e "${YELLOW}Android SDK Home: $ANDROID_HOME${NC}"

# Step 1: Setup Android SDK if not present
if [ ! -d "$ANDROID_HOME" ]; then
    echo -e "${YELLOW}[1/6] Downloading Android SDK...${NC}"
    mkdir -p "$ANDROID_HOME"
    cd /tmp
    wget -q "$SDK_URL" -O cmdline-tools.zip
    unzip -q cmdline-tools.zip
    mkdir -p "$ANDROID_HOME/cmdline-tools"
    mv cmdline-tools "$ANDROID_HOME/cmdline-tools/latest"
    rm cmdline-tools.zip
    cd -
else
    echo -e "${GREEN}[1/6] Android SDK found${NC}"
fi

# Accept licenses
echo -e "${YELLOW}[2/6] Accepting Android licenses...${NC}"
"$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" --licenses <<< 'y' > /dev/null 2>&1 || true

# Install SDK components
echo -e "${YELLOW}[3/6] Installing SDK components (platforms, build-tools)...${NC}"
"$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" \
    "platforms;android-34" \
    "platforms;android-33" \
    "build-tools;34.0.0" \
    > /dev/null 2>&1 || true

# Step 2: Install dependencies
echo -e "${YELLOW}[4/6] Installing npm dependencies...${NC}"
npm install --legacy-peer-deps

# Step 3: Build web assets
echo -e "${YELLOW}[5/6] Building web assets with Vite...${NC}"
npm run build

# Step 4: Setup Capacitor and build APK
echo -e "${YELLOW}[6/6] Building Android APK...${NC}"
npm install @capacitor/cli @capacitor/core @capacitor/android @capacitor/push-notifications @capacitor/local-notifications --legacy-peer-deps > /dev/null 2>&1
npx cap add android > /dev/null 2>&1 || true
# sync to ensure newly added plugins are wired into the native project
npx cap sync android > /dev/null 2>&1 || true

cd android
export JAVA_HOME="/usr/lib/jvm/java-21-openjdk-amd64"
if [ ! -d "$JAVA_HOME" ]; then
    export JAVA_HOME="$(dirname $(dirname $(readlink -f $(which java))))"
fi

chmod +x gradlew
./gradlew assembleDebug --no-daemon

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✓ APK Build Complete!${NC}"
echo -e "${GREEN}================================${NC}"

APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
    SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo -e "${GREEN}✓ APK Location: $(pwd)/$APK_PATH${NC}"
    echo -e "${GREEN}✓ APK Size: $SIZE${NC}"
    echo -e "\n${YELLOW}Installation Instructions:${NC}"
    echo "  1. Connect your Android device (12+) via USB"
    echo "  2. Enable USB debugging"
    echo "  3. Run: adb install -r app/build/outputs/apk/debug/app-debug.apk"
    echo -e "\n${YELLOW}Features:${NC}"
    echo "  • Google Meet-style call codes (abc-def-ghi)"
    echo "  • Real-time peer-to-peer video calling"
    echo "  • In-call chat with emoji reactions"
    echo "  • Hand raise system"
    echo "  • Network quality monitoring"
    echo "  • Call history with statistics"
    echo "  • Screen sharing & recording"
else
    echo -e "${RED}✗ APK not found at $APK_PATH${NC}"
    exit 1
fi
