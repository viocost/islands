#!/bin/bash

# given a bin directory
# and a destination directory
# builds islands distribution

while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in

        -p|--path)
            BUILD_PATH="$2"
            shift
            shift
            ;;
        -s|--source)
            SOURCE_PATH=$(readlink -f "$2")
            shift
            shift
            ;;
        -d|--dev)
            DEV=true
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



if [[ ! -d $SOURCE_PATH ]]; then
   echo "Source path does not exist. You should build Islands first"
   exit 1
fi


# Making dir structure
make_dir ${BUILD_PATH}
BUILD_PATH=$(readlink -f "$BUILD_PATH")
CORE_PATH=${BUILD_PATH}/core
DATA_PATH=${BUILD_PATH}/data
APPS_PATH=${BUILD_PATH}/apps
CONFIG_PATH=${BUILD_PATH}/config

make_dir $BUILD_PATH
make_dir $CORE_PATH
make_dir $DATA_PATH
make_dir $APPS_PATH
make_dir $CONFIG_PATH

# Copying core files
if [[ -d ${SOURCE_PATH}/core/linux  ]]; then
    echo "Copying linux core files"
    cp -r ${SOURCE_PATH}/core/linux $CORE_PATH
fi


if [[ -d ${SOURCE_PATH}/core/win32 ]]; then
    echo "Copying win32 core files"
    cp -r ${SOURCE_PATH}/core/win32 $CORE_PATH
fi

if [[ -d ${SOURCE_PATH}/core/win64 ]]; then
    echo "Copying win64 core files"
    cp -r ${SOURCE_PATH}/core/win64 $CORE_PATH
fi

if [[ -d ${SOURCE_PATH}/core/mac ]]; then
    echo "Copying mac core files"
    cp -r ${SOURCE_PATH}/core/mac $CORE_PATH
fi

# Copying driver scripts

cp ${SOURCE_PATH}/linux.sh ${BUILD_PATH}
cp ${SOURCE_PATH}/win.bat ${BUILD_PATH}
cp ${SOURCE_PATH}/mac.sh ${BUILD_PATH}

# Copying engine and chat
if [[ -d ${SOURCE_PATH}/apps ]]; then
    echo "Copying apps"
    cp -r  ${SOURCE_PATH}/apps/* ${APPS_PATH}
fi


# Copying engine and chat
if [[ -d ${SOURCE_PATH}/config ]]; then
    echo "Copying config"
    cp -r  ${SOURCE_PATH}/config/* ${CONFIG_PATH}
fi

cp  ${SOURCE_PATH}/zip-build.sh ${BUILD_PATH}

echo "Islands installed at ${BUILD_PATH}"
