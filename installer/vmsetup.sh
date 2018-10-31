#!/bin/bash

# assuming that guest additions have been installed and internet connection is enabled
echo "Preparing VM..."

#!/bin/bash

BRANCH="master"

USAGE="

    ISLANDS SETUP OPTIONS:

	-b | --branch
	specific branch to pull code from

    -h | --help
	Print help message
"

POSITIONAL=()
while [[ $# -gt 0 ]]

do
key="$1"

case $key in
    -b | --branch)
    BRANCH="$2"
	shift
    shift
    ;;
    -h | --help)
    HELP=true
    shift
    ;;
esac
done


if [[ ${HELP} ]]; then
    echo "$USAGE";
    exit 0;
fi


apt update
apt install dirmngr
apt install unzip

echo Installing Node.JS
apt install curl -y
apt install apt-transport-https -y
curl -sL https://deb.nodesource.com/setup_10.x | bash - 
apt install -y nodejs 

echo Installing TOR
echo 'deb https://deb.torproject.org/torproject.org stretch main' | tee -a /etc/apt/sources.list 
echo 'deb-src https://deb.torproject.org/torproject.org stretch  main' | tee -a /etc/apt/sources.list 

gpg --keyserver keys.gnupg.net --recv A3C4F0F979CAA22CDBA8F512EE8CBC9E886DDD89 
gpg --export A3C4F0F979CAA22CDBA8F512EE8CBC9E886DDD89 | apt-key add - 

apt update
apt install tor deb.torproject.org-keyring -y
echo Configuring and starting TOR...
phash=$(tor --hash-password 'TheP@$sw0rd' | grep 16\:.*)
echo 'ControlPort 9051' | tee -a /etc/tor/torrc
echo 'HashedControlPassword' $phash | tee -a /etc/tor/torrc
echo 'ExitPolicy reject *:*' | tee -a /etc/tor/torrc
service tor start
echo Done

mkdir /usr/src/app

curl -sL https://github.com/viocost/islands/archive/${BRANCH}.zip -o /tmp/${BRANCH}.zip
cd /tmp
unzip ${BRANCH}.zip
cp islands-${BRANCH}/chat/* /usr/src/app/ -r
npm install -g pm2  
pm2 update 
mkdir /data/islandsData/history -p

groupadd islands
adduser island islands



