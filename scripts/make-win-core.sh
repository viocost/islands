#!/bin/bash
#

# Since all required binaries for windows are already distributes pre-compiled
# The whole build process is just downloading and unzipping them, which
# can be accomplished in Linux without any problems

USAGE="
Islands core build for windows
USAGE

./make-win-core.sh -p /build/path

-p, --path
    Destination path.

-h, --help
    Print this message
"

WINDOWS_CORE_VERSION="1.1.1"

DEPENDENCIES=(npm,make,zip,tar,wget)

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

function check_dependencies(){
    OLD_IFS=$IFS
    IFS=","

    # Checking dependencies
    for i in $DEPENDENCIES; do
        if ! $(${i} --version >/dev/null 2>/dev/null)  ; then                #
            echo "$i is not installed. Install it and try again" #
            exit 1                                               #
        fi                                                       #
    done

    echo aftre loop
    # Checking if unzip installed
    if ! $(unzip -hh >/dev/null 2>/dev/null); then
        echo "$i is not installed. Install it and try again"
    fi

    # Checking if python is installed
    if [[ $(python --version) ]]; then
        PYTHON=python
    elif [[ $(python3 --version) ]]; then
        PYTHON=python3
    else
        echo "Python not found. Install python and try again. Exiting..."
        exit 1
    fi

    IFS=$OLD_IFS
}

# curl -L -O "https://www.torproject.org/dist/torbrowser/9.0.5/tor-win32-0.4.2.6.zip"
# curl -L -O "https://www.torproject.org/dist/torbrowser/9.0.5/tor-win64-0.4.2.6.zip"

check_dependencies


INSTALLER_PATH=$(pwd)

while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in

        -p|--path)
            BASE_PATH=$2
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


if [ -z ${BASE_PATH+x} ]; then
    echo Destination directory not specified. Exiting...
    exit 1
fi

make_dir $BASE_PATH

BASE_PATH=$(readlink -f $BASE_PATH)


BUILD_PATH=${BASE_PATH}/core
CORE_PATH_32=${BUILD_PATH}/win32
CORE_PATH_64=${BUILD_PATH}/win64
VERSION_PATH_32=${CORE_PATH_32}/core.version
VERSION_PATH_64=${CORE_PATH_64}/core.version


make_dir $BUILD_PATH
make_dir $CORE_PATH_32
make_dir $CORE_PATH_64

function install_node(){
    cd $BUILD_PATH
    curl -L -O https://nodejs.org/dist/v13.9.0/node-v13.9.0-win-x86.zip
    curl -L -O https://nodejs.org/dist/v13.9.0/node-v13.9.0-win-x64.zip
    unzip  node-v13.9.0-win-x86.zip
    mv  node-v13.9.0-win-x86 ${CORE_PATH_32}/node
    unzip  node-v13.9.0-win-x64.zip
    mv  node-v13.9.0-win-x64 ${CORE_PATH_64}/node
    rm node-v13.9.0-win-x86.zip
    rm node-v13.9.0-win-x64.zip
}


function install_tor(){
    cd $BUILD_PATH
    curl -L -O  "https://www.torproject.org/dist/torbrowser/10.0.5/tor-win32-0.4.4.6.zip"
    curl -L -O  "https://www.torproject.org/dist/torbrowser/10.0.5/tor-win64-0.4.4.6.zip"
    unzip tor-win32-0.4.4.6.zip
    mv ./Tor ${CORE_PATH_32}/tor
    rm -rf ./Data

    unzip tor-win64-0.4.4.6.zip
    mv ./Tor ${CORE_PATH_64}/tor

    rm -rf ./Data
    rm tor-win32-0.4.4.6.zip
    rm tor-win64-0.4.4.6.zip
}


install_node &&
install_tor &&
echo ${WINDOWS_CORE_VERSION} > ${VERSION_PATH_32} &&
echo ${WINDOWS_CORE_VERSION} > ${VERSION_PATH_64} &&
echo WINDWS CORE BUILD SUCCESSFUL
