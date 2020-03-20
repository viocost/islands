#!/bin/bash

while [[ $# -gt 0 ]]

do
key="$1"

case $key in
    -p|--chat-port)
    export CHAT_PORT="$2"
    shift
    shift
    ;;
    -d|--debug)
    export DEBUG=true
    shift
    ;;
    -h | --help)
    HELP=true
    shift
    ;;

esac
done

echo "IN LINUX.SH. chat port is ${CHAT_PORT}"
if [[ -z $CHAT_PORT ]]; then
    export $CHAT_PORT=4000
fi

# Core binaries for easy access
export BASE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export NODEJS=${BASE}/core/linux/bin/node
export NPM=${BASE}/core/linux/bin/npm
export TOR=${BASE}/core/linux/bin/tor
export TORIFY=${BASE}/core/linux/bin/torify
export LD_LIBRARY_PATH=${BASE}/core/linux/lib

# Data dir
export ISLANDS_DATA=${BASE}/data

# Apps dir
export APPS=${BASE}/apps

# Config dir
export CONFIG=${BASE}/config

# Tor dynamic password
echo Starting up island...
${NODEJS} ${APPS}/engine/engine.js
