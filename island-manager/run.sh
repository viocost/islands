#!/bin/bash

# Make sure to run this from Island Manager root directory
# Assummed that python v3.7 or higher, pip3 and python3-venv are installed
if [ ! -d "./venv" ]; then
    echo creating virtual environment
    mkdir venv
    python3 -m venv ./venv
    
fi

source ./venv/bin/activate 
pip3 install -r requirements.txt


if [[ $1 == "--debug" ]]; then
    echo Running in debug mode
    python3 ./main.py --debug
else
    echo Running in normal mode
    python3 ./main.py
fi


deactivate

