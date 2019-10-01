#!/bin/bash

# This script refreshes islands source code within the running container
# This allows refresh source without restarting tor and re-launching hidden services

POSITIONAL=()
while [[ $# -gt 0 ]]
do
    key="$1"

    case $key in
        -bf|--build-front)
            BUILD_FRONT=true
            shift
            ;;
        -c|--container)
            CONTAINER_NAME="$2"
            shift
            shift
            ;;
    esac
done

if [[ ! ${CONTAINER_NAME} ]]; then
    echo Container name is required! Exiting...
    exit 0;
fi

if [[ ${BUILD_FRONT} ]]; then
    echo Building front...
    npm run build-front;
fi


docker exec -it ${CONTAINER_NAME} rm -rf *
docker cp ./ ${CONTAINER_NAME}:/usr/src/app
docker exec -it ${CONTAINER_NAME} pm2 restart 0

echo All set!
