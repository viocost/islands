#!/bin/bash

VERSION="1.0.2"

BINARIES_NOT_FOUND="Islands binaries for Linux are not found."

# Core binaries for easy access
export BASE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ ! -d "${BASE}/core/linux" ]]; then
    echo "$BINARIES_NOT_FOUND"
    exit 1
fi

NODEJS=${BASE}/core/linux/bin/node
APPS=${BASE}/apps

echo Starting up island...
${NODEJS} ${APPS}/engine/engine.js  $@
