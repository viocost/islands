#!/bin/bash
#
# This script runs chat in new core


while [[ $# -gt 0 ]]

do
key="$1"

case $key in
    -p|--path)
    CORE_PATH="$2"
    shift
    shift
    ;;
    -db|--debug)
    DEBUG=true
    shift
    ;;
    -bf|--build-front)
    BUILD_FRONT=true
    shift
    ;;
    -h | --help)
    HELP=true
    shift
    ;;

esac
done

# Assuming new core structure
# CORE_PATH is path to islands root
# Setting other paths

RUN=${CORE_PATH}/linux.sh
APPS_PATH=${CORE_PATH}/apps
CHAT_PATH=${APPS_PATH}/chat
CHAT_SOURCE_PATH=$(readlink -f .)


if [[ ! -d ${CORE_PATH} ]]; then
    echo "Islands core path not found"
    exit 1
fi

if [[ ! -f ${RUN} ]]; then
    echo "Run file not found inside the core"
    exit 1
fi

if [[ ! -d  ${APPS_PATH} ]]; then
    echo "Apps path not found instde the core"
    exit 1
fi


if [[ $BUILD_FRONT ]]; then
    npm run build
    npm prune --production
fi

cp -r $CHAT_SOURCE_PATH $APPS_PATH
