#!/bin/bash
cd ~/islands/chat
sudo docker build -f Dockerfile -t islands:chat .
sudo docker run --rm -it -p 80:4000 -p 9229:9229 --mount type=bind,source=D:\islandsData,target=/islandsData islands:chat