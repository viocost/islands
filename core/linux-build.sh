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
./linux-build.sh -p BUILD_PATH_ [OPTIONS]

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
    i - i2p

    Ex.:node -c nrt
    The script will install only node.js, redis and tor
    Order does not matter

-h, --help
    Print this message
"

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
COMPONENTS="tn"

INSTALLER_PATH=$(pwd)

while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in

        -p|--path)
            BASE_PATH=$(readlink -f "$2")
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
CORE_PATH=${BUILD_PATH}/linux

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
    wget https://nodejs.org/dist/v12.14.1/node-v12.14.1-linux-x64.tar.xz
    tar -xvf node-v12.14.1-linux-x64.tar.xz
    cd  node-v12.14.1-linux-x64
    cp -r * $CORE_PATH
    cd $BUILD_PATH
}

function install_python(){
    cd $BUILD_PATH
    wget "https://www.python.org/ftp/python/3.7.6/Python-3.7.6.tar.xz"
    tar -xvf Python-3.7.6.tar.xz
    cd Python-3.7.6
    ./configure --prefix=$CORE_PATH
    make -j $(nproc) && make install
}

# TOR dependencies

function zlib(){
    wget -O -  "https://zlib.net/zlib-1.2.11.tar.gz" | tar zxvf -
    cd zlib-1.2.11
    ./configure --prefix="${CORE_PATH}" --libdir="${CORE_PATH}/lib" --sharedlibdir="${CORE_PATH}/lib" --includedir="${CORE_PATH}/include"
    make -j$(nproc)
    make install
    cd $BUILD_PATH
}

function zstd(){
    wget "https://github.com/facebook/zstd/archive/dev.zip"
    unzip ./dev.zip -d ./zstd
    cd ./zstd/zstd-dev/
    make
    cp ./lib/libzstd.* ${LIB_PATH}
    cd $BUILD_PATH
    rm -rf ./dev.zip ./zstd
}

function libevent(){
    wget -O - "https://github.com/libevent/libevent/releases/download/release-2.1.11-stable/libevent-2.1.11-stable.tar.gz" | tar zxvf -
    cd libevent-2.1.11-stable
    ./configure --prefix="${CORE_PATH}"
    make -j $(nproc)
    make install
    cd $BUILD_PATH
}

function libssl(){
    wget -O - "https://www.openssl.org/source/openssl-1.1.1d.tar.gz" | tar zxvf -
    cd openssl-1.1.1d
    ./config --prefix="${CORE_PATH}"
    make -j $(nproc)
    make install
    cd $BUILD_PATH
}


function getall_mac(){

    wget -O -  "https://zlib.net/zlib-1.2.11.tar.gz" | tar zxvf -
    wget -O - "https://github.com/libevent/libevent/releases/download/release-2.1.11-stable/libevent-2.1.11-stable.tar.gz" | tar zxvf -
    wget -O - "https://www.openssl.org/source/openssl-1.1.1d.tar.gz" | tar zxvf -
    wget -O - "https://dist.torproject.org/tor-0.4.2.6.tar.gz" | tar zxvf -


}

function install_tor(){
    libevent
    libssl
    zlib
    zstd
    cd $BUILD_PATH
    wget "https://dist.torproject.org/tor-0.4.2.6.tar.gz"
    tar -xvf tor-0.4.2.6.tar.gz
    cd tor-0.4.2.6
    ./configure --prefix=${CORE_PATH} \
            --with-libevent-dir="${LIB_PATH}" \
            --with-openssl-dir="${LIB_PATH}" \
            --with-zlib-dir="${LIB_PATH}" \
            --disable-manpage \
            --disable-html-manual \
            --disable-asciidoc
    make -j $(nproc) && make install
    cd $BUILD_PATH
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



if [[ $COMPONENTS == *"p"* ]]; then
    if ! install_python; then
        echo Python build failed
        exit 1
    fi
fi
if [[ $COMPONENTS == *"n"* ]]; then

    if ! install_nodejs; then
        echo Node.JS build failed
        exit 1
    fi
fi
if [[ $COMPONENTS == *"t"* ]]; then
    if ! install_tor; then
        echo Tor build failed
        exit 1
    else
        echo Tor build success.
    fi
fi
if [[ $COMPONENTS == *"i"* ]]; then
    if ! install_i2p; then
        echo Tor build failed
        exit 1
    fi
fi

# cleanup
rm -rf  ${BUILD_PATH}/tor* ${BUILD_PATH}/zlib* ${BUILD_PATH}/openssl* ${BUILD_PATH}/libevent* ${BUILD_PATH}/node* ${BUILD_PATH}/Python*


# removing manpages and docs
rm -rf ${CORE_PATH}/share/man ${CORE_PATH}/share/doc

cd ${BUILD_PATH}

zip -r linux.zip ./linux

echo BUILD SUCCESSFUL!
# copy service files
#cd $INSTALLER_PATH && install_services &&  ./genconf.sh -p ${BUILD_PATH} -t ${BUILD_PATH}/bin/tor
