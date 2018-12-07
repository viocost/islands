echo "
[Unit]
 Description=/etc/rc.local Compatibility
 ConditionPathExists=/etc/rc.local
 After=network-online.target	
 
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

echo "#!/bin/sh -e
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
 
sleep 4s
/root/init.sh
exit 0

" >> /etc/rc.local

chmod +x /etc/rc.local
systemctl enable rc-local
