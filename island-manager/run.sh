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

python3 ./main.py

deactivate

