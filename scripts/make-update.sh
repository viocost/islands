#!/bin/bash
#
# This script creates an update file from current build


FILENAME="islands_update"
FULL_PACKAGE=false
EXCLUSIONS="-I data -I islands -I core -I update -I config"


while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in

        -p|--path)
            DEST_PATH="$2"
            shift
            shift
            ;;

        -s|--source)
            BUILD_PATH=$(readlink -f "$2")
            shift
            shift
            ;;

        -h|--help)
            echo "$USAGE"
            exit 0
            ;;
        *)
            break
    esac
done

function make_dir(){
    # $1 - full path to new directory
    if [[ ! -d $1 ]]; then
        if ! mkdir -p $1; then
            echo "Unable to create new directory: ${1}"
            echo "Exiting..."
            exit 1
        fi
    fi
}


if [ -z ${BUILD_PATH+x} ]; then
    echo "Path to build is not set";
    exit 1
elif [  -z ${DEST_PATH+x}   ]; then
    echo "Destination path is not set";
    exit 1
fi

if [[ ! -f ${BUILD_PATH}/apps/chat/package.json ]]; then
    echo "Build is invalid"
    exit 1
fi

make_dir ${DEST_PATH}

DEST_PATH=$(readlink -f "${DEST_PATH}")

cd ${BUILD_PATH}

VERSION=$(python -c "import sys, json
try:
    with open('${BUILD_PATH}/apps/chat/package.json', 'r') as fp:
         print(json.load(fp)['version'])
except Exception:
    exit(0)
")


FILENAME=${FILENAME}_${VERSION}.zip

mkdir ./islands
cp -r $(ls ${EXCLUSIONS} ) ./islands
mkdir ./islands/data

zip -r $DEST_PATH/$FILENAME  ./islands
rm -rf ./islands

echo Update build finished.
