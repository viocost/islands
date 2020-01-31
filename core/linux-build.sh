#!/bin/bash
#
#

USAGE="
USAGE:
./linux-build.sh -p _BUILD_DIR_PATH_ [OPTIONS]

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
            R_PATH=$(readlink -f "$2")
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


echo Path is $R_PATH

if [[ ! -d $R_PATH ]]; then
    echo "Build directory not found"
    exit 1
fi

if [[ -n $COMPONENTS ]]; then
    echo $COMPONENTS
fi

function install_nodejs(){
    echo "Downloading node.js..."
    wget https://nodejs.org/dist/v12.14.1/node-v12.14.1-linux-x64.tar.xz
    tar -xvf node-v12.14.1-linux-x64.tar.xz
    cd  node-v12.14.1-linux-x64
    cp -r * $R_PATH
    cd ../
    echo Node js installation finished
}

function install_python(){
    wget "https://www.python.org/ftp/python/3.7.6/Python-3.7.6.tar.xz"
    tar -xvf Python-3.7.6.tar.xz
    cd Python-3.7.6
    ./configure --prefix=$R_PATH
    make -j 12 && make install
    cd ../
    echo Python installation finished

}

function install_redis(){
    wget "http://download.redis.io/releases/redis-5.0.7.tar.gz"
    tar -xvf redis-5.0.7.tar.gz
    cd redis-5.0.7
    make -j 12
    make PREFIX=$R_PATH install
    cd ../
    echo Redis install finished
}


function install_tor(){
    wget "https://dist.torproject.org/tor-0.4.2.6.tar.gz"
    tar -xvf tor-0.4.2.6.tar.gz
    cd tor-0.4.2.6
    ./configure --prefix=$R_PATH
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
rm -rf redis* tor* node* Python*
