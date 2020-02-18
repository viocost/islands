#!/bin/bash

BASE_DIR=$(pwd)

echo Starting island

${BASE_DIR}/core/bin/node ${BASE_DIR}/core/services/island.js ${BASE_DIR}/island.conf
