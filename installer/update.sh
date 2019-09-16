#!/bin/bash
pm2 stop 0
pm2 delete 0
rm -rf /usr/src/app/*
cd $1
cp -r * /usr/src/app/
cd /usr/src/app/
npm install
npm build-front
npm prune --production
reboot
