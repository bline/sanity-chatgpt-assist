#!/bin/bash

# Set the directory to store extensions.json
EXT_DIR="$(dirname "$0")"
EXT_FILE="$EXT_DIR/extensions.json"

# Ensure jq is installed
if ! command -v jq &> /dev/null; then
    echo "❌ Error: jq is not installed. Please install jq and try again."
    exit 1
fi

# Export installed extensions to a JSON file
node /opt/vscode-reh-web-linux-x64/out/server-main.js --list-extensions | jq -R . | jq -s . > "$EXT_FILE"

echo "✅ Extensions exported to $EXT_FILE"
