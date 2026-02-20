#!/bin/bash

# Claude CLI Custom Avatar Installer
# Usage:
#   custom_claude.sh              Interactive menu
#   custom_claude.sh <number>     Install by menu number (1-12) or restore (0)
#   custom_claude.sh <key>        Install by avatar key (party_hat, crown, etc.)
#   custom_claude.sh random       Install a random avatar

CLI_FILE="/opt/bb/lib/node_modules/@anthropic-ai/claude-code/cli.js"
BACKUP_FILE="${CLI_FILE}.backup"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Check if CLI file exists
if [ ! -f "$CLI_FILE" ]; then
    echo "Error: Claude CLI file not found at $CLI_FILE"
    exit 1
fi

# Restore from backup first to ensure clean state
if [ -f "$BACKUP_FILE" ]; then
    cp "$BACKUP_FILE" "$CLI_FILE" 2>/dev/null
else
    echo "Creating backup of original CLI file..."
    cp "$CLI_FILE" "$BACKUP_FILE"
    [ -z "$1" ] && echo "✓ Backup created"
fi

# Get avatar keys from config
AVATAR_KEYS=$(node -e "const {avatars}=require('$SCRIPT_DIR/avatars');console.log(Object.keys(avatars).join('\n'))")
AVATAR_COUNT=$(echo "$AVATAR_KEYS" | wc -l | tr -d ' ')

# Resolve input (number or key) to an avatar key
resolve_key() {
    local input="$1"
    # Restore
    if [ "$input" = "0" ]; then
        echo "RESTORE"
        return
    fi
    # Random
    if [ "$input" = "random" ]; then
        echo "$AVATAR_KEYS" | shuf -n 1
        return
    fi
    # Direct avatar key match
    if echo "$AVATAR_KEYS" | grep -qx "$input"; then
        echo "$input"
        return
    fi
    # Numeric index (1-based)
    if [[ "$input" =~ ^[0-9]+$ ]] && [ "$input" -ge 1 ] && [ "$input" -le "$AVATAR_COUNT" ]; then
        echo "$AVATAR_KEYS" | sed -n "${input}p"
        return
    fi
    echo ""
}

if [ -n "$1" ]; then
    choice="$1"
else
    echo ""
    echo "=== Custom Avatar Installer ==="
    echo ""
    echo "Choose an option:"
    node -e "
        const {avatars}=require('$SCRIPT_DIR/avatars');
        Object.keys(avatars).forEach((k,i) => {
            console.log((i+1) + ') ' + avatars[k].menuLabel);
        });
    "
    echo "0) Restore original"
    echo ""
    read -p "Enter your choice (0-${AVATAR_COUNT}, or avatar key): " choice
fi

avatar_key=$(resolve_key "$choice")

if [ "$avatar_key" = "RESTORE" ]; then
    if [ -f "$BACKUP_FILE" ]; then
        [ -z "$1" ] && echo "Restoring original avatar..."
        cp "$BACKUP_FILE" "$CLI_FILE"
        [ -z "$1" ] && echo "✓ Original avatar restored!"
        exit 0
    else
        echo "Error: No backup file found"
        exit 1
    fi
fi

if [ -z "$avatar_key" ]; then
    echo "Invalid choice: $choice"
    exit 1
fi

AVATAR_NAME=$(node -e "const {avatars}=require('$SCRIPT_DIR/avatars');console.log(avatars['$avatar_key'].name)")
[ -z "$1" ] && echo "" && echo "Installing $AVATAR_NAME avatar..."

node "$SCRIPT_DIR/do_claude_replacement.js" "$CLI_FILE" "$avatar_key"

if [ $? -eq 0 ]; then
    if [ -z "$1" ]; then
        echo ""
        echo "=== Installation Complete! ==="
        echo ""
        echo "Your new $AVATAR_NAME avatar is installed!"
        echo ""
        echo "⚠️  CRITICAL: You MUST completely exit and restart Claude"
        echo "   1. Press Ctrl+D or type 'exit' to quit Claude"
        echo "   2. Run 'claude' command again"
        echo ""
        echo "To restore original: $0 0"
    fi
    exit 0
else
    echo "✗ Installation failed. Restoring backup..."
    cp "$BACKUP_FILE" "$CLI_FILE"
    exit 1
fi
