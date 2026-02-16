#!/usr/bin/env bash
# Build the Rust HTML Editor .app bundle for macOS.
# Prerequisites: Rust, Node.js, Xcode CLT (see docs/INSTALL.md)

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

# Install npm dependencies if needed
if [ ! -d node_modules ]; then
	echo "Installing npm dependencies..."
	npm install
fi

# Build the .app bundle
echo "Building Rust HTML Editor..."
npx tauri build --bundles app

APP_PATH="src-tauri/target/release/bundle/macos/Rust HTML Editor.app"
echo ""
echo "Build complete: $APP_PATH"
echo "Run with: open \"$APP_PATH\""
