#!/bin/bash
#
# This script generates default islands core configuration

CONFIG_PATH=$(readlink -f .)
OUTPUT_NAME="island.conf"

while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        -p|--path)
            CONFIG_PATH=$(readlink -f "$2")
            shift
            shift
            ;;
        -t|--tor)
            TOR=$2
            shift
            shift
            ;;
        *)
            break
    esac
done

if [[ ! -f ${TOR} ]]; then
    echo Tor executable not found
    exit 1
fi

TORPASSWD=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 24 | head -n 1)
TORPASSWDHASH=$($TOR --hash-password $TORPASSWD)
echo tor password: ${TORPASSWD}
echo tor password hash: ${TORPASSWDHASH}


CONFIG="
[Tor]
TorSOCKSPort=15140
TorControlPort=15141
TorExitPolicy=reject *:*
TorPassword=${TORPASSWD}
TorPassHash=${TORPASSWDHASH}



[i2p]


"

echo ${CONFIG} > ${CONFIG_PATH}/${OUTPUT_NAME}
