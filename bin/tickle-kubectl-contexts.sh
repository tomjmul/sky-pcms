#!/bin/bash
# Tickle all kubectl contexts to keep auth tokens fresh
# Runs a quick cluster-info check against each context

LOG_FILE="$HOME/.kubectl-tickle.log"
TIMEOUT=3

# Trap SIGINT (Ctrl-C) and SIGTERM to allow clean exit
trap 'echo "Interrupted at $(date)" >> "$LOG_FILE"; exit 130' INT TERM

echo "=== kubectl context tickle started at $(date) ===" >> "$LOG_FILE"

# Get all contexts
contexts=$(kubectl config get-contexts -o name 2>/dev/null)

if [ -z "$contexts" ]; then
    echo "No kubectl contexts found" >> "$LOG_FILE"
    exit 1
fi

success=0
failed=0

for ctx in $contexts; do
    echo -n "Tickling $ctx... " >> "$LOG_FILE"

    # Use timeout to avoid hanging on unreachable clusters
    if timeout "$TIMEOUT" kubectl --context="$ctx" cluster-info &>/dev/null; then
        echo "OK" >> "$LOG_FILE"
        ((success++))
    else
        echo "FAILED (timeout or unreachable)" >> "$LOG_FILE"
        ((failed++))
    fi
done

echo "=== Completed: $success succeeded, $failed failed ===" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
