#!/bin/bash

VERSION="1.0.2"

BINARIES_NOT_FOUND="Islands binaries for MacOS are not found."

if [[ ! -d "${BASE}/core/mac" ]]; then
    echo "$BINARIES_NOT_FOUND"
    exit 1
fi

# Core binaries for easy access
export BASE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"


function unleash(){
    if [[ -z $1 ]]; then
        echo No starting path provided
        exit 1
    fi

    for i in $(ls $1); do
        if [[ -d "${1}/${i}" ]] && [[ ${i} != "node_modules"  ]]; then
            unleash "${1}/${i}"
        else
            if  [[ ${i} == *".dylib" ]] || [[ -x ${1}/${i}  ]]; then
                echo  unquarantine "${1}/${i}"
                xattr -d com.apple.quarantine "${1}/${i}" > /dev/null 2>/dev/null
            fi
        fi
    done
}

NODEJS=${BASE}/core/mac/bin/node
APPS=${BASE}/apps


# Removing quarantine nonsense
echo "Preparing islands"
unleash ${BASE}/core/mac

echo Starting up island...
${NODEJS} ${APPS}/engine/engine.js  $@
