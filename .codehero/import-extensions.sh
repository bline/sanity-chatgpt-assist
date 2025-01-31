#!/bin/bash

# Set the extensions.json path
EXT_DIR="$(dirname "$0")"
EXT_FILE="$EXT_DIR/extensions.json"

# Check if the extensions.json file exists
if [ ! -f "$EXT_FILE" ]; then
    echo "❌ Error: $EXT_FILE not found!"
    exit 1
fi

# Ensure jq is installed
if ! command -v jq &> /dev/null; then
    echo "❌ Error: jq is not installed. Please install jq and try again."
    exit 1
fi

# Install extensions from JSON
jq -r '.[]' "$EXT_FILE" | xargs -n1 node /opt/vscode-reh-web-linux-x64/out/server-main.js --install-extension

echo "✅ Extensions imported successfully!"
