#!/bin/bash
#
# This script puts Islands together



USAGE="
USAGE:
./build-islands.sh -p <BUILD_PATH>  [OPTIONS]

OPTIONS:
-p, --path
    Build path

-d, --dev
    Include all dev packages
"




INSTALLER_PATH=$(pwd)
DEV=false

# Parse  args

while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in

        -p|--path)
            # This script assumes that core is also installed at BUILD_PATH/core
            BUILD_PATH="$2"
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


# Checking if make is installed
if [[ ! $(make --version) ]]; then
    echo "make not found. Install make and try again. Exiting..."
    exit 1
fi

# Create directory tree
#

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

make_dir ${BUILD_PATH}
BUILD_PATH=$(readlink -f ${BUILD_PATH})

# Create directory tree
APPS_PATH=${BUILD_PATH}/apps
CONFIG_PATH=${BUILD_PATH}/config

make_dir $APPS_PATH
make_dir $CONFIG_PATH


# Checking if linux core is installed. If no - exit
if [[ ! -d ${BUILD_PATH}/core/linux/bin ]]; then
    echo Islands core for linux is not found. Build it first and try again.
    exit 1
else
    OLD_PATH=$PATH
    export PATH=$(readlink -f ${BUILD_PATH})/core/linux/bin:$PATH
fi



# Checking if npm is installed
if [[ ! $(npm --version) ]]; then
    echo "npm not found. Install npm and try again. Exiting..."
    exit 1
fi



echo Copying drivers
cp ${INSTALLER_PATH}/drivers/* ${BUILD_PATH}

echo Copying zip script
cp  ${INSTALLER_PATH}/zip-build.sh ${BUILD_PATH}


# copy driver scripts
#
# generate default config
node ${INSTALLER_PATH}/config-gen/generate.js -p ${CONFIG_PATH}
#
# copy apps and core scripts

#Emptying any content of apps and data
rm -rf ${BUILD_PATH}/apps/*

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


echo Build has finished.
