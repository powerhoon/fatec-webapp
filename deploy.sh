#!/bin/bash
cd /root/fatec-webapp
git fetch origin main 2>/dev/null
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)
if [ "$LOCAL" != "$REMOTE" ]; then
    echo "[$(date)] New commit, pulling..."
    git pull origin main
    echo "Deployed: $(git log --oneline -1)"
else
    echo "[$(date)] Already up to date"
fi
