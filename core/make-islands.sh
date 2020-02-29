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

if [[ ! -d $BASE_PATH ]]; then
    echo Build directory does not exist. Creating
    if ! mkdir $BASE_PATH; then
        echo "Unable to create build directory"
        exit 1
    fi
fi

BUILD_PATH=${BASE_PATH}/islands

if [[ ! -d $BUILD_PATH ]]; then
    echo Build directory does not exist. Creating
    if ! mkdir $BUILD_PATH; then
        echo "Unable to create build directory"
        exit 1
    fi
fi


#
# Fetch all binaries into the build dir
#
# unzip binaries
#
# copy driver scripts
#
# copy apps
