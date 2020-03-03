#!/bin/bash

# Core binaries for easy access
export BASE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export NODEJS=${BASE}/core/linux/bin/node
export NPM=${BASE}/core/linux/bin/npm
export PYTHON=${BASE}/core/linux/bin/python3
export PIP=${BASE}/core/linux/bin/pip3
export TOR=${BASE}/core/linux/bin/tor
export TORIFY=${BASE}/core/linux/bin/torify

# Data dir
export ISLANDS_DATA=${BASE}/data

# Apps dir
export APPS=${BASE}/apps

# Config file
export ISLANDS_CONF=${base}

echo Starting up island...
${NODEJS} ${APPS}/engine/engine.js
