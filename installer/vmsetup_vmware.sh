#!/bin/bash

# Origin state:
# Assuming we have clean Debian installation with working internet access 
# No vmware tools installed yet 
# We are logged in as root

# Shared folder is enabled and specified
# !IMPORTANT Shared folder name is islandsData


mkdir /mnt/hgfs

apt update
apt install open-vm-tools -y 
apt install open-vm-tools-desktop -y




