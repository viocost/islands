#!/bin/bash
#
#

# Default config
CONFIG="

[Tor]
TorSOCKSPort=15140
TorControlPort=15141
TorExitPolicy=reject *:*
TorPassword=${TORPASSWD}
TorPassHash=${TORPASSWDHASH}
    p - python


[i2p]
"

USAGE="
USAGE:
./linux-build.sh -p _BUILD_DIBUILD_PATH_ [OPTIONS]

OPTIONS:

-p, --path
    Build path

-j, --workers
    Number of processor cores to optimize building process
    default: 1

-c, --components
    Components to install:
    t - tor
    n - node
    p - python
    i - mac

    Ex.:node -c nrt
    The script will install only node.js, redis and tor
    Order does not matter

-h, --help
    Print this message
"

# To make up for lack of proper readlink
function lsf(){
    (cd $(dirname "$1") && echo $(pwd)/$(basename "$1"))
}

# Number of cores default
# Will be used during the compilation
WORKERS=1


# Components to build and install
# t - tor
# n - node
# p - python
# i - i2p
#
#By default all will be installed
COMPONENTS="tnpi"

INSTALLER_PATH=$(pwd)

while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in

        -p|--path)
            BASE_PATH=$(lsf "$2")
            shift
            shift
            ;;
        -j|--workers)
            WORKERS=$2
            shift
            shift
            ;;
        -c|--components)
            COMPONENTS=$2
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




if [[ ! -d $BASE_PATH ]]; then
    echo Build directory does not exist. Creating
    if ! mkdir $BASE_PATH; then
        echo "Unable to create build directory"
        exit 1
    fi
fi

BUILD_PATH=${BASE_PATH}/islands
CORE_PATH=${BUILD_PATH}/mac

if [[ ! -d $BUILD_PATH ]]; then
    echo Build directory does not exist. Creating
    if ! mkdir $BUILD_PATH; then
        echo "Unable to create build directory"
        exit 1
    fi
fi


if [[ ! -d $CORE_PATH ]]; then
    echo Build directory does not exist. Creating
    if ! mkdir $CORE_PATH; then
        echo "Unable to create build directory"
        exit 1
    fi
fi


LIB_PATH="${CORE_PATH}/lib"



cd $BUILD_PATH
echo Path is $BUILD_PATH


if [[ -n $COMPONENTS ]]; then
    echo $COMPONENTS
fi

function install_nodejs(){
    echo "Downloading node.js..."
    curl -L -O https://nodejs.org/dist/v12.16.1/node-v12.16.1-darwin-x64.tar.gz
    tar -xvf node-v12.16.1-darwin-x64.tar.gz
    cd  node-v12.14.1-linux-x64
    cp -r * $CORE_PATH
    cd ../
    echo Node js installation finished
}

function install_python(){
    curl -L -O "https://www.python.org/ftp/python/3.7.6/Python-3.7.6.tar.xz"
    tar -xvf Python-3.7.6.tar.xz
    cd Python-3.7.6
    ./configure --prefix=$CORE_PATH
    make -j $(sysctl -n hw.ncpu) && make install
    echo Python installation finished. Creating virtual environment
    if [[ -d  ./islands-pyenv ]]; then
        rm -rf ./islands-pyenv/*
    fi
    ${CORE_PATH}/bin/python3 -m venv  ${CORE_PATH}/islands-pyenv

    echo Activating python venv
    source ${CORE_PATH}/islands-pyenv/bin/activate
    echo installing python libraries
    pip install stem
    cd ../
    echo all set

}

# TOR dependencies

function zlib(){
    curl -L  "https://zlib.net/zlib-1.2.11.tar.gz" | tar zxvf -
    cd zlib-1.2.11
    ./configure --prefix="${CORE_PATH}"
    make -j$(sysctl -n hw.ncpu)
    make install
    cd ../

}

function libevent(){
    curl -L "https://github.com/libevent/libevent/releases/download/release-2.1.11-stable/libevent-2.1.11-stable.tar.gz" | tar zxvf -
    cd libevent-2.1.11-stable
    ./configure --prefix="${CORE_PATH}"
    make -j $(sysctl -n hw.ncpu)
    make install
    cd ..

}

function libssl(){
    curl -L "https://www.openssl.org/source/openssl-1.1.1d.tar.gz" | tar zxvf -
    cd openssl-1.1.1d
    ./config --prefix="${CORE_PATH}"
    make -j $(sysctl -n hw.ncpu)
    make install
    cd ..
}


function getall_mac(){

    curl -L  "https://zlib.net/zlib-1.2.11.tar.gz" | tar zxvf -
    curl -L "https://github.com/libevent/libevent/releases/download/release-2.1.11-stable/libevent-2.1.11-stable.tar.gz" | tar zxvf -
    curl -L "https://www.openssl.org/source/openssl-1.1.1d.tar.gz" | tar zxvf -
    curl -L "https://dist.torproject.org/tor-0.4.2.6.tar.gz" | tar zxvf -


}

function install_tor(){
    libevent
    libssl
    zlib

    curl -L -O "https://dist.torproject.org/tor-0.4.2.6.tar.gz"
    tar -xvf tor-0.4.2.6.tar.gz
    cd tor-0.4.2.6
    ./configure --prefix=${CORE_PATH} \
            --with-libevent-dir="${LIB_PATH}" \
            --with-openssl-dir="${LIB_PATH}" \
            --with-zlib-dir="${LIB_PATH}"
    make -j $(sysctl -n hw.ncpu) && make install
    cd ../
    echo Tor installation completed
}

function install_i2p(){
    echo installing i2p
    # if [[ ! -d $BUILD_PATH/bin ]]; then
    #    mkdir $BUILD_PATH/bin
    # fi
    #cp $INSTALLER_PATH/pre-compiled/i2p/i2pd  $BUILD_PATH/bin
    echo i2p installed
}

# Installing core services
#function install_services(){
    #if [[ ! -d ${BUILD_PATH}/services ]]; then
    #    mkdir ${BUILD_PATH}/services
    #fi
#
    ## Copying core services
    #cp -r ./services/* ${BUILD_PATH}/services
#
    ## Copying driver script
    #cp ./drivers/linux.sh ${BUILD_PATH}/island.sh
    #chmod +x ${BUILD_PATH}/island.sh

#}





if [[ $COMPONENTS == *"p"* ]]; then install_python; fi
if [[ $COMPONENTS == *"n"* ]]; then install_nodejs; fi
if [[ $COMPONENTS == *"t"* ]]; then install_tor; fi
if [[ $COMPONENTS == *"i"* ]]; then install_i2p; fi



# cleanup
rm -rf  ${BUILD_PATH}/tor* ${BUILD_PATH}/zlib* ${BUILD_PATH}/openssl* ${BUILD_PATH}/libevent* ${BUILD_PATH}/node* ${BUILD_PATH}/Python*

# copy service files
#cd $INSTALLER_PATH && install_services &&  ./genconf.sh -p ${BUILD_PATH} -t ${BUILD_PATH}/bin/tor
