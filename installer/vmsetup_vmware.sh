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

# VMWare automount setup
echo ".host:/	/mnt/hgfs	fuse.vmhgfs-fuse	allow_other	0	0" >> /etc/fstab
echo "mount /mnt/hgfs" >> /etc/rc.local
chown root:root /etc/rc.local
chmod 0755 /etc/rc.local
systemctl enable rc-local.service


