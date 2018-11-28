#! /bin/bash
#
# init.sh
# Copyright (C) 2018 kostia <kostia@i.planet-a.ru>
#
# Distributed under terms of the MIT license.
# 
# This script runs on first launch of blank Islands image
# It detects virtual environment and installs appropriate tools.
# For virtualbox it installs guest additions, for Vmware - vmware tools
# If any tool appear to be installed - script removes itself from startup and exits

install_guest_additions()
{
	apt update -y
	apt install build-essential module-assistant -y
	mount /media/cdrom
	m-a prepare -i
	sh /media/cdrom/VBoxLinuxAdditions.run
	umount /media/cdrom
	systemctl disable rc-local
	rm -rf /etc/rc.local
	rm -rf /etc/systemd/system/rc-local.service
	reboot
}

# if Virtualbox and no guestadditions installed
if cat /sys/devices/virtual/dmi/id/product_name | grep -iqF VirtualBox; then
	if ! lsmod | grep -iqF vboxguest; then
		echo 'installing guest additions'
		install_guest_additions 
	fi	
fi	



