#!/bin/bash

VERSION="1.0.1"


# Core binaries for easy access
export BASE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODEJS=${BASE}/core/linux/bin/node
APPS=${BASE}/apps

echo Starting up island...
${NODEJS} ${APPS}/engine/engine.js  $@
