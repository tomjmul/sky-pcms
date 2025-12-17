#!/bin/bash

PROJECT_DIR="/Users/tommy/Development/ott-pcms"
PROXY_DIR="$PROJECT_DIR/.ignored/docker/tiny-proxy"

export HTTP_PROXY=http://localhost:8888
export NO_PROXY="localhost 192.168.10.1 .k8s.pcms.awscsi.com .k8s.aws.atom.sky.com .atom.mgmt.nbcuott.com .atom.eu.summerott.com .dev.cosmic.sky .eks.amazonaws.com .npskooniedc.com"

cd /Users/tommy/Development/ott-pcms

# Cleanup function
cleanup() {
    # Shut down tiny-proxy container only if no other Claude Code instances are running
    CLAUDE_COUNT=$(pgrep -f "/claude" | wc -l)
    if [ "$CLAUDE_COUNT" -le 0 ]; then
        echo "Shutting down tiny-proxy (no other Claude Code instances running)..."
        docker compose -f "$PROXY_DIR/docker-compose.yml" down
    else
        echo "Keeping tiny-proxy running (other Claude Code instances detected)..."
    fi
}

# Trap EXIT, SIGHUP, SIGINT, and SIGTERM to ensure cleanup runs
trap cleanup EXIT SIGHUP SIGINT SIGTERM

# Start tiny-proxy if not already running
if ! docker compose -f "$PROXY_DIR/docker-compose.yml" ps --status running | grep -q tinyproxy; then
    echo "Starting tiny-proxy..."
    docker compose -f "$PROXY_DIR/docker-compose.yml" up -d
fi

/Users/tommy/.nvm/versions/node/v21.1.0/bin/claude "$@"


