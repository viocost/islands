#!/bin/bash
# Origin state:
# Assuming we have clean Debian installation with working internet access 
# No vmware tools installed yet 
# We are logged in as root

# Shared folder is enabled and specified
# !IMPORTANT Shared folder name is islandsData


#mkdir /mnt/hgfs

#apt update
#apt install open-vm-tools -y 
#apt install open-vm-tools-desktop -y


# Creating rc.local

echo  "#!/bin/sh -e
#
# rc.local
#
# This script is executed at the end of each multiuser runlevel.
# Make sure that the script will "exit 0" on success or any other
# value on error.
#
# In order to enable or disable this script just change the execution
# bits.
#
# By default this script does nothing.
 
exit 0
" >> /etc/rc.local

chmod +x /etc/rc.local

echo "[Unit]
 Description=/etc/rc.local Compatibility
 ConditionPathExists=/etc/rc.local
 
[Service]
 Type=forking
 ExecStart=/etc/rc.local start
 TimeoutSec=0
 StandardOutput=tty
 RemainAfterExit=yes
 SysVStartPriority=99
 
[Install]
 WantedBy=multi-user.target
" >> /etc/systemd/system/rc-local.service


# VMWare automount setup
echo ".host:/	/mnt/hgfs -o uid=1000 -o gid=1000 -o umask=775	fuse.vmhgfs-fuse	allow_other	0	0" >> /etc/fstab
echo "mount /mnt/hgfs" >> /etc/rc.local
chown root:root /etc/rc.local
chmod 0755 /etc/rc.local
systemctl enable rc-local.service


