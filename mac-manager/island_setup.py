import re
import hashlib
from threading import Thread
from time import sleep
from vboxinstaller import VBoxInstaller
from vm_installer import VMInstaller
from installer_exceptions import *
from executor import ShellExecutor as Executor



from os import path, makedirs, environ


class IslandSetup:

    def __init__(self, config):

        self.vm_installer = None
        self.vbox_installer = None
        self.__config = config


    # Initializes vm installer in separate thread and starts it
    def run_vm_installer(self, *args, **kwargs):
        self.vm_installer = VMInstaller(*args, **kwargs)
        self.vm_installer.start()

    def run_vbox_installer(self, *args, **kwargs):
        self.vbox_installer = VBoxInstaller(*args, **kwargs)
        self.vbox_installer.start()





    def get_islands_ip(self):
        res = Executor.exec_sync('vboxmanage guestcontrol Island run --exe "/sbin/ip" '
                            '--username root --password islands  --wait-stdout -- ip a  | grep eth1')
        print("Island IP address request result: \nreturn: "+ str(res[0])+ "\nstdout: " + res[1]+ "stderr: " + res[2])
        return re.search(r'(\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b)', res[1]).group()




    def sha1(self, fname):
        hash_sha1 = hashlib.sha1()
        with open(fname, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_sha1.update(chunk)
        return hash_sha1.hexdigest()

    # Parses pshared folder path
    # Accepts either absolute path or relative to home directory
    # If relative path (started with dots) will be passed  - InvalidPathFormat exception will be risen
    def parse_shared_folder_path(self, data_folder_path):
        data_folder_path = data_folder_path.strip()
        path_elements = data_folder_path.split("/")
        path_elements.append("islandsData")
        if data_folder_path[0] == "~":
            path_elements[0] = environ["HOME"]
        elif data_folder_path[0] == ".":
            raise InvalidPathFormat("Path to shared folder must be absolute")
        return "/".join(path_elements)

    # END

    def is_setup_required(self):
        if not self.is_vbox_set_up():
            return "Virtualbox not installed or not found"
        if not self.is_islands_vm_exist():
            return "Island virtual machine not installed or not found"
        return False

    # SETTINGS SECTION
    def set_islands_vm_name(self, name):
        pass

    def set_islands_vm_id(self, id):
        pass

    def get_vmware_docs(self):
        pass

    def is_vbox_set_up(self):
        return self.is_vbox_installed() and self.is_vbox_up_to_date()

    def is_vbox_installed(self):
        res = Executor.exec_sync("{vboxmanage} -v".format(vboxmanage=self.__config['vboxmanage']))
        return res[0] == 0

    def is_vbox_up_to_date(self):

        res = Executor.exec_sync("{vboxmanage} -v".format(vboxmanage=self.__config['vboxmanage']))
        version = re.sub(r'[^\d^\.]', "", res[1])
        version = [int(i) for i in version.split('.')]
        version[2] = int(str(version[2])[0:2])
        return (res[0] == 0 and version[0] >= 5
                and version[1] >= 2 and version[2] >= 20)

    def is_islands_vm_exist(self):
        try:
            execres = Executor.exec_sync("vboxmanage list vms | "
                                     "grep  \\\"{vmname}\\\" ".format(vmname=self.__config['vmname']))
            return execres[0] == 0
        except Exception as e:
            print("is_islands_vm_exist EXCEPTION!: " + str(e))
            return False






# Attach guest additions spell:
# vboxmanage storageattach <vmname> --storagectl IDE --port 1 --device 0 --type dvddrive --medium /Applications/VirtualBox.app/Contents/MacOS/VBoxGuestAdditions.iso

# Port forwarding spell:
# vboxmanage controlvm   Island natpf1 "r1, tcp, 127.0.0.1, 4000, 192.168.56.102, 4000"