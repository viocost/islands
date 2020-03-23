#!/bin/bash
#
#This script updates Islands apps and services within a given directory



if [[ -z "$1" ]]; then
    echo "Please, provide islands path"
    exit 1
fi
