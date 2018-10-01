#!/bin/bash
cd ~/islands/chat
sudo docker build -f Dockerfile2 -t islands:chat .
sudo docker container run --rm -it -p 4005:4000 -p 9231:9231 --mount type=bind,source=/home/kostia/islandsData2,target=/islandsData islands:chat