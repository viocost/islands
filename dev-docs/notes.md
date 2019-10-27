# Islands image preparation guide

### Step 1: make a clean install of Debian Stretch v9.5.0 amd64:


##### Virtual hardware:
* Hard drive VMDK dynamically allocated 8GB
* RAM 1gb

##### Install parameters
* hostname - island
* domain name - islands
* root pass - islands
* islands pass - islands
* Language - US English

##### Packages
* SSH server 
* system utilities


### Step 2:
Make sure you have an Internet access from within the virtual machine


### Step 3: Place init.sh and install-rclocal.sh scripts inside /root directory
You may download it with wget

### Step 4: Set up init.sh for startup 
For that just run install-rclocal.sh script

### Done!
Now after next reboot the machine will set itself up.


Note: further setup requires Internet access and  guest additions image to be mounted



