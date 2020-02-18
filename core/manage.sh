#!/bin/bash

RED="\033[1;31m"
GREEN="\033[1;32m"
NOCOLOR="\033[0m"
VERSION=2.0

TITLE="Welcome to Islands v${VERSION}"
STATS="

Status:

Tor -  %F${GREEN}UP
Redis - UP

"

MENU="
What would you like to do:

1. Run  island
2. Stop island
3. Apps
4. Update stats
5. Exit manager


Please enter number 1-5 and press Enter

"

clear


echo -e "${TITLE}"
echo -e "${STATS}"
echo -e "${MENU}"


while read in; do
    echo -e $in
done
