#!/bin/bash
#
# This script puts Islands together



USAGE="
USAGE:
./build-islands.sh -p <BUILD_PATH> -w <link-to-windows-build> -l <link-to-linux-build> -m <link-to-mac-build>

OPTIONS:
-p, --path
    Build path

-d, --dev
    Include all dev packages

-w, --windows
    Path or link to windows build

-l, --linux
    Path or link to linux build

-m, --mac
    Path or link to mac build

-v, --version
    Binaries version
"




INSTALLER_PATH=$(pwd)
DEV=false
MAC_ARCHIVE="mac.zip"
WINDOWS_ARCHIVE="windows.zip"
LINUX_ARCHIVE="linux.zip"

# Parse  args

while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in

        -p|--path)
            BUILD_PATH=$(readlink -f "$2")
            shift
            shift
            ;;

        -d|--dev)
            DEV=true
            shift
            ;;
        -m|--mac)
            MAC=$2
            shift
            shift
            ;;
        -w|--windows)
            WINDOWS=$2
            shift
            shift
            ;;

        -l|--linux)
            LINUX=$2
            shift
            shift
            ;;
        -v|--version)
            VERSION=$2
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

# Checking if npm is installed
if [[ ! $(npm --version) ]]; then
    echo "npm not found. Install npm and try again. Exiting..."
    exit 1
fi

# Checking if make is installed
if [[ ! $(make --version) ]]; then
    echo "make not found. Install make and try again. Exiting..."
    exit 1
fi

# Checking if python is present
if [[ $(python --version) ]]; then
    PYTHON=python
elif [[ $(python3 --version) ]]; then
    PYTHON=python3
else
    echo "Python not found. Install python and try again. Exiting..."
    exit 1
fi


# Create directory tree
#

function make_dir(){
    # $1 - full path to new directory
    if [[ ! -d $1 ]]; then
        if ! mkdir $1; then
            echo "Unable to create new directory: ${1}"
            echo "Exiting..."
            exit 1
        fi
    fi
}



# Create directory tree
CORE_PATH=${BUILD_PATH}/core
DATA_PATH=${BUILD_PATH}/data
APPS_PATH=${BUILD_PATH}/apps
CONFIG_PATH=${BUILD_PATH}/config

make_dir $BUILD_PATH
make_dir $CORE_PATH
make_dir $DATA_PATH
make_dir $APPS_PATH
make_dir $CONFIG_PATH


function prepare_core_bin(){
    # this function copies or downloads archive with binaries to the core path
    # unpacks and removes it
    # It assumes that archive contains directories with core binaries for specific os
    #
    # Args:
    # $1 - path or url to archive
    # $2 - archive name

    cd ${CORE_PATH}

    if [[ -f ${1} ]]; then
        cp ${1} ${CORE_PATH}
    else
        if ! wget ${1}; then
            echo "Failed to download core files from ${1}. Exiting..."
            exit 1
        fi
    fi

    unzip ${2}
    rm ${2}
}

# Fetch all binaries into the build dir if required
if [ ! -z ${MAC+x} ]; then
    prepare_core_bin ${MAC} ${MAC_ARCHIVE}
fi

if [ ! -z ${LINUX+x} ]; then
    prepare_core_bin ${LINUX} ${LINUX_ARCHIVE}
fi

if [ ! -z ${WINDOWS+x} ]; then
    prepare_core_bin ${WINDOWS} ${WINDOWS_ARCHIVE}
fi


echo Copying drivers
cp ${INSTALLER_PATH}/drivers/* ${BUILD_PATH}

echo Copying zip script
cp  ${INSTALLER_PATH}/zip-build.sh ${BUILD_PATH}


# copy driver scripts
#
# generate default config
${PYTHON} ${INSTALLER_PATH}/config-gen/generate.py -p ${CONFIG_PATH}
#
# copy apps and core scripts

#Emptying any content of apps and data
rm -rf ${BUILD_PATH}/apps/*
rm -rf ${BUILD_PATH}/data/*

echo Preparing engine

cd ${INSTALLER_PATH}/services/engine
npm run clean
$DEV && npm run build-dev || npm run build


echo Copying engine
cp -r ${INSTALLER_PATH}/services/engine ${BUILD_PATH}/apps

# Building islands from source
echo Preparing Islands chat
cd ${INSTALLER_PATH}/../chat
npm run unbuild
npm run build-dev && npm run build-front && npm run build

[[ ! $DEV ]] && npm prune --production

echo Copying chat
cp -r ${INSTALLER_PATH}/../chat ${BUILD_PATH}/apps


if [ ! -z ${VERSION+x} ]; then
    echo Core version: ${VERSION} > ${CORE_PATH}/core.version
fi
