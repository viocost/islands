#!/bin/bash

# Core binaries for easy access
export BASE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export NODEJS=${BASE}/core/mac/bin/node
export NPM=${BASE}/core/mac/bin/npm
export PYTHON=${BASE}/core/mac/bin/python3
export PIP=${BASE}/core/mac/bin/pip3
export TOR=${BASE}/core/mac/bin/tor
export TORIFY=${BASE}/core/mac/bin/torify
export DYLD_LIBRARY_PATH=${BASE}/core/mac/lib

# Data dir
export ISLANDS_DATA=${BASE}/data

# Apps dir
export APPS=${BASE}/apps

# Config dir
export CONFIG=${BASE}/config

# Tor dynamic password
export TOR_PASSWD=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
export TOR_PASSWD_HASH=$(${TOR} --hash-password ${TOR_PASSWD})

echo Starting up island...
${NODEJS} ${APPS}/engine/engine.js
