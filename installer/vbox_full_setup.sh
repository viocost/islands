#! /bin/bash
#
# vbox_full_setup.sh
# Copyright (C) 2018 kostia <kostia@i.planet-a.ru>
#
# Distributed under terms of the MIT license.
#


# ASSUMPTIONS AT THIS POINT
# 1. Guest additions have been installed
# 2. Internet connection is enabled
# 3. Running script as root



BRANCH="master"

USAGE="

    ISLANDS SETUP OPTIONS:

    -b | --branch
    specific branch to pull code from

    -h | --help
    Print help message
"

if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
  exit
fi


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

echo INSTALLING FROM ${BRANCH}

apt update -y
apt install dirmngr -y
apt install unzip -y

echo Installing Node.JS
apt install curl -y
apt install apt-transport-https -y


echo Installing TOR
echo 'deb https://deb.torproject.org/torproject.org stretch main' | tee -a /etc/apt/sources.list
echo 'deb-src https://deb.torproject.org/torproject.org stretch  main' | tee -a /etc/apt/sources.list

gpg --no-tty --keyserver keys.gnupg.net --recv A3C4F0F979CAA22CDBA8F512EE8CBC9E886DDD89
gpg --no-tty --export A3C4F0F979CAA22CDBA8F512EE8CBC9E886DDD89 | apt-key add -

apt update
apt install tor deb.torproject.org-keyring -y
echo Configuring and starting TOR...
phash=$(tor --hash-password 'TheP@$sw0rd' | grep 16\:.*)
echo 'ControlPort 9051' | tee -a /etc/tor/torrc
echo 'HashedControlPassword' $phash | tee -a /etc/tor/torrc
echo 'ExitPolicy reject *:*' | tee -a /etc/tor/torrc
echo Tor configuration completed. Launching service...
service tor start

echo Installing Node.JS!
curl -sL https://deb.nodesource.com/setup_10.x | bash -
apt install -y nodejs

mkdir /usr/src/app

curl -sL https://github.com/viocost/islands/archive/${BRANCH}.zip -o /tmp/${BRANCH}.zip
cd /tmp
unzip ${BRANCH}.zip 
cp islands-${BRANCH}/chat/* /usr/src/app/ -r
cd /usr/src/app/
npm install
npm install -g pm2
pm2 update


#starting app

pm2 start /usr/src/app/app.js --node-args="--experimental-worker" -- -c /usr/src/app/configvbox.json
pm2 save
pm2 startup

echo Installation complete!

