#!/bin/bash

VERSION="1.01"

function unleash(){
    if [[ -z $1 ]]; then
        echo No starting path provided
        exit 1
    fi

    for i in $(ls $1); do
        if [[ -d "${1}/${i}" ]] && [[ i != node_modules  ]]; then
            unleash "${1}/${i}"
        else
            if  [[ ${i} == *".dylib" ]] || [[ -x ${1}/${i}  ]]; then
                echo  unquarantine "${1}/${i}"
                xattr -d com.apple.quarantine "${1}/${i}" > /dev/null 2>/dev/null
            fi
        fi
    done
}

# Core binaries for easy access
export BASE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export NODEJS=${BASE}/core/mac/bin/node
export NPM=${BASE}/core/mac/bin/npm
export TOR=${BASE}/core/mac/bin/tor
export TORIFY=${BASE}/core/mac/bin/torify
export DYLD_LIBRARY_PATH=${BASE}/core/mac/lib

# Data dir
export ISLANDS_DATA=${BASE}/data

# Apps dir
export APPS=${BASE}/apps

# Config dir
export CONFIG=${BASE}/config

# Removing quarantine nonsense
echo "Preparing islands"
unleash $BASE/core/mac/bin


echo Starting up island...
${NODEJS} ${APPS}/engine/engine.js


