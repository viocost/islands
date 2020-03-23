#!/bin/bash
#
#This script updates Islands apps and services within a given directory


declare -a ISLANDS

while [[ $# -gt 0 ]]

do
key="$1"

case $key in
    -p|--path)
    ISLANDS+=(${2})
    shift
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

[[ $BUILD_FRONT ]] && {
    echo building front
    npm run build-front || {
        echo Unable to compile front end. Exiting...
        exit 1
    }
}

echo ISLANDS: ${ISLANDS[@]}


for IPATH in ${ISLANDS[@]}; do
    echo Updating island at ${IPATH}...


    [[ -d "$IPATH" ]] && [[ -d ${IPATH}/apps ]] && [[ -d ${IPATH}/apps/chat ]] || {
        echo Islands distribution is invalid.
        echo Exiting
        continue
    }

    CHAT_SOURCE_PATH=$(readlink -f $(pwd))
    APPS_PATH="${IPATH}/apps"

    cp -r $CHAT_SOURCE_PATH $APPS_PATH

    echo Island at ${IPATH} updated.
done
