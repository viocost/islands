import re
import hashlib
from threading import Thread
from time import sleep
from vboxinstaller import VBoxInstaller
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
        self.vm_installer = VMInstaller(self, *args, **kwargs)
        self.vm_installer.start()

    def run_vbox_installer(self, *args, **kwargs):
        self.vbox_installer = VBoxInstaller(*args, **kwargs)
        self.vbox_installer.start()



    # TODO async
    # DOWNLOAD AND INSTALL VM METHODS
    # Download Islands vm from specified source
    # Destination is app directory
    def download_vm(self):
        return Executor.exec("curl -L {link} >> ~/Downloads/Island.ova".format(
            link=self.__config["vm_download"]))

    # TODO async
    # Imports downloaded vm
    # Image must be downloaded into app root directory
    def import_vm(self, path_to_image):
        if not path.exists(path_to_image):
            raise IslandsImageNotFound
        res = Executor.exec("vboxmanage import {path}  ".format(path=path_to_image))
        if res[0] != 0:
            raise ImportVMError('%s' % res[2])


    # This assumes that VM is already imported
    # There is no way to check whether vboxnet0 interface exists,
    # so we issue erroneous command to modify it
    # if exitcode is 1 - interface doesn't exists, so we create it
    # if exitcode is 2 - interface found and we can add it to our VM
    # Otherwise there is some other error and we raise it
    def setup_host_only_adapter(self):
        try:
            Executor.exec_sync("vboxmanage hostonlyif ipconfig vboxnet0")
        except Exception as e:
            if e.returncode == 1:
                Executor.exec_sync("vboxmanage hostonlyif create")
            elif e.returncode != 2:
                raise e
        # Installing adapter onto vm
        Executor.exec_sync("vboxmanage modifyvm {vmname} --nic2 hostonly --cableconnected2 on"
                      " --hostonlyadapter2 vboxnet0".format(vmname=self.__config["vmname"]))

    def get_islands_ip(self):
        res = Executor.exec_sync('vboxmanage guestcontrol Island run --exe "/sbin/ip" '
                            '--username root --password islands  --wait-stdout -- ip a  | grep eth1')
        return re.search(r'(\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b)', res).group()

    def setup_port_forwarding(self, port):
        island_ip = self.get_islands_ip()
        if not island_ip:
            raise PortForwardingException("Was not able to determine ip address of Islands VM")
        res = Executor.exec_sync('vboxmanage controlvm   Island natpf1 "r1, tcp, 127.0.0.1, {port},'
                      ' {island_ip}, 4000"'.format(port=port, island_ip=island_ip))
        self.__config["local_access"] = "<a href='http://localhost:{port}'>http://localhost:{port}</a>".format(port=port)
        self.__config.save()
        return res

    # Sets up a shareed folder for the imported vm
    def setup_shared_folder(self, data_folder_path = "~/islandsData"):
        fullpath = self.parse_shared_folder_path(data_folder_path)
        if not path.exists(fullpath):
            makedirs(fullpath)
        return Executor.exec_sync("vboxmanage sharedfolder add Island "
                    "--name islandsData -hostpath {hostpath} -automount".format(hostpath=fullpath))

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





class VMInstaller:
    def __init__(self, setup,  on_message, on_complete, on_error, data_path, download=False, image_path=None, port=False):
        self.thread = None
        self.setup = setup
        self.on_message = on_message
        self.on_complete = on_complete
        self.on_error = on_error
        self.download = download
        self.data_path = data_path
        self.image_path = image_path
        self.port = port
        if not download:
            assert(bool(image_path))

    def start(self):
        self.thread = Thread(target=self.install)
        self.thread.start()

    def install(self):
        try:
            if self.download:
                self.on_message("Downloading Islands VM...")
                self.setup.download_vm()
                self.on_message("Download complete")
            self.on_message("Importing VM...")
            self.setup.import_vm(self.image_path if self.image_path else "~/Downloads/Island.ova")
            self.on_message("Image imported. Configuring...")
            self.setup.setup_host_only_adapter()
            self.on_message("Network configured..")
            self.setup.setup_shared_folder(self.data_path)
            self.on_message("Data folder set up... Launching VM")
            # Start machine... Wait until controlvm is available then run scripts
            print(Executor.exec("vboxmanage startvm Island --type headless"))
            self.on_message("VM started...")
            Executor.exec("vboxmanage storageattach Island --storagectl IDE --port 1 --device 0 --type dvddrive --medium /Applications/VirtualBox.app/Contents/MacOS/VBoxGuestAdditions.iso")
            self.on_message("Guest additions mounted... Waiting for initial setup. \n"
                            "This will take a while! Do not turn off your computer.")
            self.wait_guest_additions()
            sleep(3)
            self.wait_guest_additions()
            if self.port:
                self.setup.setup_port_forwarding(self.port)
            self.on_message("Guest additions are installed. Fetching Islands setup script..")
            Executor.exec("""vboxmanage guestcontrol Island run --exe "/usr/bin/wget" --username root --password islands --wait-stdout --wait-stderr -- wget "https://raw.githubusercontent.com/viocost/islands/dev/installer/vbox_full_setup.sh" -O "/root/isetup.sh" """)
            print(Executor.exec("""vboxmanage guestcontrol Island run --exe "/bin/chmod" --username root --password islands --wait-stdout --wait-stderr -- chmod +x /root/isetup.sh """))
            self.on_message("Installation in progress. This step takes a while... Grab some tea")
            print("Launching setup script")
            Executor.exec("""vboxmanage guestcontrol Island run --exe "/bin/bash" --username root --password islands --wait-stdout --wait-stderr -- bash /root/isetup.sh -b dev""")
            self.on_message("Setup completed. Restarting Islands...")

            sleep(1)
            Executor.exec("""vboxmanage controlvm Island acpipowerbutton""")

            for i in range(10):
                try:
                    sleep(3)
                    Executor.exec("""vboxmanage startvm Island --type headless  """)
                    self.on_complete("Islands Virtual Machine successfully installed.")
                    return
                except Exception:
                    continue
            self.on_error(Exception("VM launch unsuccessfull"))

        except Exception as e:
            print("VMinstaller exception: " + str(e))
            print(e.output.strip().decode("utf8"))
            self.on_error(e)

    def wait_guest_additions(self):
        while True:
            try:
                Executor.exec("""vboxmanage guestcontrol Island run --exe "/bin/ls" --username root --password islands  --wait-stdout -- ls "/" """)
                print("Looks liek vboxmanage available now! Returning...")
                return
            except Exception as e:
                print(e.output.strip().decode("utf8"))
                sleep(15)
                continue



# Attach guest additions spell:
# vboxmanage storageattach <vmname> --storagectl IDE --port 1 --device 0 --type dvddrive --medium /Applications/VirtualBox.app/Contents/MacOS/VBoxGuestAdditions.iso

# Port forwarding spell:
# vboxmanage controlvm   Island natpf1 "r1, tcp, 127.0.0.1, 4000, 192.168.56.102, 4000"