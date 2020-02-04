#!/bin/bash
#
#

USAGE="
USAGE:
./linux-build.sh -p _BUILD_DICORE_PATH_ [OPTIONS]

OPTIONS:

-p, --path
    Build path

-j, --workers
    Number of processor cores to optimize building process
    default: 1

-c, --components
    Components to install:
    t - tor
    r - redis
    n - node
    p - python
    i - i2p

    Ex.:node-c nrt
    Python in installing only node.js, redis and tor
    Order does not matter

-h, --help
    Print this message
"

# Number of cores default
# Will be used during the compilation
WORKERS=1


# Components to build and install
# t - tor
# r - redis
# n - node
# p - python
# i - i2p
#
#By default all will be installed
COMPONENTS="trnpi"

while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in

        -p|--path)
            BUILD_PATH=$(readlink -f "$2")
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



if [[ ! -d $BUILD_PATH ]]; then
    echo Build directory does not exist. Creating
    if ! mkdir $BUILD_PATH; then
        echo "Unable to create build directory"
        exit 1
    fi
fi

CORE_PATH="${BUILD_PATH}/core"

if [[ ! -d  $CORE_PATH ]]; then
    if ! mkdir $CORE_PATH; then
        echo "Unable to create core path."
        exit 1
    fi
fi


cd $BUILD_PATH
echo Path is $CORE_PATH


if [[ -n $COMPONENTS ]]; then
    echo $COMPONENTS
fi

function install_nodejs(){
    echo "Downloading node.js..."
    wget https://nodejs.org/dist/v12.14.1/node-v12.14.1-linux-x64.tar.xz
    tar -xvf node-v12.14.1-linux-x64.tar.xz
    cd  node-v12.14.1-linux-x64
    cp -r * $CORE_PATH
    cd ../
    echo Node js installation finished
}

function install_python(){
    wget "https://www.python.org/ftp/python/3.7.6/Python-3.7.6.tar.xz"
    tar -xvf Python-3.7.6.tar.xz
    cd Python-3.7.6
    ./configure --prefix=$CORE_PATH
    make -j 12 && make install
    echo Python installation finished. Creating virtual environment
    if [[ -d  ./islands-pyenv ]]; then
        rm -rf ./islands-pyenv/*
    fi
    ${CORE_PATH}/bin/python3 -m venv  ${CORE_PATH}/islands-pyenv

}

function install_redis(){
    wget "http://download.redis.io/releases/redis-5.0.7.tar.gz"
    tar -xvf redis-5.0.7.tar.gz
    cd redis-5.0.7
    make -j 12
    make PREFIX=$CORE_PATH install
    cd ../
    echo Redis install finished
}


function install_tor(){
    wget "https://dist.torproject.org/tor-0.4.2.6.tar.gz"
    tar -xvf tor-0.4.2.6.tar.gz
    cd tor-0.4.2.6
    ./configure --prefix=$CORE_PATH
    make -j 12&& make install
    cd ../
    echo Tor installation completed
}

function install_i2p(){
    echo installing i2p
}

if [[ $COMPONENTS == *"p"* ]]; then install_python; fi
if [[ $COMPONENTS == *"n"* ]]; then install_nodejs; fi
if [[ $COMPONENTS == *"t"* ]]; then install_tor; fi
if [[ $COMPONENTS == *"r"* ]]; then install_redis; fi
if [[ $COMPONENTS == *"i"* ]]; then install_i2p; fi

# cleanup
rm -rf ${BUILD_PATH}/redis* ${BUILD_PATH}/tor* ${BUILD_PATH}/node* ${BUILD_PATH}/Python*
