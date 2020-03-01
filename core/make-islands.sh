#!/bin/bash
#
# This script puts Islands together



USAGE="
USAGE:
./build-islands.sh -p <BUILD_PATH> -w <link-to-windows-build> -l <link-to-linux-build> -m <link-to-mac-build>

OPTIONS:
-p, --path
    Build path

-w, --windows
    Path or link to windows build

-l, --linux
    Path or link to linux build

-m, --mac
    Path or link to mac build

"




INSTALLER_PATH=$(pwd)

MAC_ARCHIVE="mac.zip"
WINDOWS_ARCHIVE="windows.zip"
LINUX_ARCHIVE="linux.zip"

# Parse  args

while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in

        -p|--path)
            BASE_PATH=$(readlink -f "$2")
            shift
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
        -h|--help)
            echo "$USAGE"
            exit 0
            ;;
        *)
            break
    esac
done


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
            echo "Failed to download mac core files. Exiting..."
            exit 1
        fi
    fi

    unzip ${2}
    rm ${2}
}

# Create directory tree
BUILD_PATH=${BASE_PATH}/islands
CORE_PATH=${BUILD_PATH}/core
DATA_PATH=${BUILD_PATH}/data
APPS_PATH=${BUILD_PATH}/apps

make_dir $BASE_PATH
make_dir $BUILD_PATH
make_dir $CORE_PATH
make_dir $DATA_PATH
make_dir $APPS_PATH

# Fetch all binaries into the build dir
prepare_core_bin ${MAC} ${MAC_ARCHIVE}
prepare_core_bin ${LINUX} ${LINUX_ARCHIVE}
prepare_core_bin ${WINDOWS} ${WINDOWS_ARCHIVE}






# copy driver scripts
#
# generate default config
#
# copy apps and core scripts
#
# cleanup
