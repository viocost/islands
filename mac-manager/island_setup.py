from threading import Thread
from executor import ShellExecutor as Executor
from time import sleep

from os import path, makedirs, environ


class IslandSetup():
    def __init__(self, config):
        self.vm_installer = None
        self.__config = config
        self.commands = {
            "download_vbox": self.download_vbox,
            "mount_vbox_distro": self.mount_vbox_distro,
            "install_vbox": self.install_vbox,
            "unmount_vbox_distro": self.unmount_vbox_distro,
            "delete_vbox_distro": self.delete_vbox_distro,
        }

    def run_vm_installer(self, *args, **kwargs):
        self.vm_installer = VMInstaller(self, *args, **kwargs)
        self.vm_installer.start()

    def run(self, command):
        if command not in self.commands:
            raise KeyError("Invalid command")
        try:
            return {
                "result": str(self.commands[command]()),
                "error": False

            }
        except Exception as e:
            return {
                "error": True,
                "result": "Error: {command} \n{errmsg}".format(
                    command=command, errmsg=str(e)
                )
            }


    def download_vbox(self):
        res =  Executor.exec("curl {link} >> ./virtualbox.dmg".format(
            link=self.__config["vbox_download"]
        ))
        print("Download complete: " + str(res))
        return res

    def mount_vbox_distro(self):
        res = Executor.exec("hdiutil attach virtualbox.dmg -mountpoint VirtualBox")
        print("Image mounted")
        return res

    def install_vbox(self):
        res = Executor.exec(
            """osascript -e 'do shell script "installer -pkg ./VirtualBox/VirtualBox.pkg -target /" with administrator privileges' """
        )
        print("Installation finished: \n" + res)

    def unmount_vbox_distro(self):
        res = Executor.exec("hdiutil detach VirtualBox")
        print("Image unmounted")
        return res

    def delete_vbox_distro(self):
        res = Executor.exec("rm -rf ./virtualbox.dmg")
        return res

    def install_virtualbox(self):
        try:
          pass
        except Exception as e:
            print("Error")
            print(e)

    # DOWNLOAD AND INSTALL VM

    # Download Islands vm from specified source
    # Destination is app directory
    def download_vm(self):
        return Executor.exec("curl -L {link} >> ./Island.ova".format(
            link=self.__config["vm_download"]))

    # Imports downloaded vm
    # Image must be downloaded into app root directory
    def import_vm(self, path_to_image):
        if not path.exists(path_to_image):
            raise IslandsImageNotFound
        return Executor.exec("vboxmanage import {path} ".format(path=path_to_image))

    # This assumes that VM is already imported
    # There is no way to check whether vboxnet0 interface exists,
    # so we issue errorneous command to modify it
    # if exitcode is 1 - interface doesn't exists, so we create it
    # if exitcode is 2 - interface found and we can add it to our VM
    # Otherwise there is some other error and we raise it
    def setup_host_only_adapter(self):
        try:
            Executor.exec("vboxmanage hostonlyif ipconfig vboxnet0")
        except Exception as e:
            if e.returncode == 1:
                Executor.exec("vboxmanage hostonlyif create")
            elif e.returncode != 2:
                raise e
        # Installing adapter onto vm
        Executor.exec("vboxmanage modifyvm {vmname} --nic2 hostonly --cableconnected2 on"
                      " --hostonlyadapter2 vboxnet0".format(vmname=self.__config["vmname"]))

    # Sets up a shareed folder for the imported vm
    def setup_shared_folder(self, data_folder_path = "~/islandsData"):
        fullpath = self.parse_shared_folder_path(data_folder_path)
        if not path.exists(fullpath):
            makedirs(fullpath)
        Executor.exec("vboxmanage sharedfolder add Island "
                      "--name islandsData -hostpath {hostpath} -automount".format(hostpath=fullpath))

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
        if not self.is_virtualbox_installed():
            return "Virtualbox not installed or not found"
        if not self.is_islands_vm_exist():
            return "Island virtual machine not installed or not found"
        return False



    def setup_island_vm(self):
        pass

    def set_islands_vm_name(self, name):
        pass

    def set_islands_vm_id(self, id):
        pass

    def get_vmware_docs(self):
        pass

    def is_virtualbox_installed(self):
        return path.exists(self.__config["vboxmanage"]) and \
            path.isfile(self.__config["vboxmanage"])

    def is_islands_vm_exist(self):
        try:
            res = Executor.exec("vboxmanage list vms | "
                "grep -c \\\"{vmname}\\\" | cat ".format(vmname=self.__config['vmname']))
            return int(res) > 0
        except Exception as e:
            print("is_islands_vm_exist EXCEPTION!: " + str(e))
            return False


    def is_vmware_found(self):
        pass


    def run_setup(self):
        pass


class VMInstaller:
    def __init__(self, setup,  on_message, on_complete, on_error, data_path, download=False, image_path=None):
        self.thread = None
        self.setup = setup
        self.on_message = on_message
        self.on_complete = on_complete
        self.on_error = on_error
        self.download = download
        self.data_path = data_path
        self.image_path = image_path
        if not download:
            assert(bool(image_path))


    def start(self):
        self.thread = Thread(target=self.install)
        self.thread.start()

    def install(self):
        try:
            if self.download:
                self.on_message(self.setup.download_vm())
                self.on_message("Download complete")
            self.on_message("Importing VM...")
            self.setup.import_vm(self.image_path if self.image_path else "./Island.ova")
            self.on_message("Image imported. Configuring...")
            self.setup.setup_host_only_adapter()
            self.on_message("Network configured..")
            self.setup.setup_shared_folder(self.data_path)
            self.on_message("Data folder set up... Launching VM")
            # Start machine... Wait until controlvm is available then run scripts
            print(Executor.exec("vboxmanage startvm Island"))
            self.on_message("VM started...")
            Executor.exec("vboxmanage storageattach Island --storagectl IDE --port 1 --device 0 --type dvddrive --medium /Applications/VirtualBox.app/Contents/MacOS/VBoxGuestAdditions.iso")
            self.on_message("Guest additions mounted... Waiting for initial setup. This will take a while...")
            self.wait_guest_additions()
            sleep(3)
            self.wait_guest_additions()
            self.on_message("Guest additions are installed. Fetching Islands setup script..")
            Executor.exec("""vboxmanage guestcontrol Island run --exe "/usr/bin/wget" --username root --password islands --wait-stdout --wait-stderr -- wget "https://raw.githubusercontent.com/viocost/islands/dev/installer/vbox_full_setup.sh" -O "/root/isetup.sh" """)

            print(Executor.exec("""vboxmanage guestcontrol Island run --exe "/bin/chmod" --username root --password islands --wait-stdout --wait-stderr -- chmod +x /root/isetup.sh """))
            self.on_message("Installation in progress. This step takes a while... Grab some tea")
            print("READY TO LAUNCH THE SCRIPT")
            Executor.exec("""vboxmanage guestcontrol Island run --exe "/bin/bash" --username root --password islands --wait-stdout --wait-stderr -- bash /root/isetup.sh -b dev""")
            sleep(1)
            Executor.exec("""vboxmanage controlvm Island acpipowerbutton""")
            sleep(2)
            Executor.exec("""vboxmanage startvm Island """)
            self.on_complete("Islands Virtual Machine successfully installed.")
        except Exception as e:
            print("VMinstaller exception: " + str(e))
            print(e.output.strip().decode("utf8"))
            self.on_error(e)

    def wait_guest_additions(self):
        while True:
            try:
                Executor.exec("""vboxmanage guestcontrol Island run --exe "/bin/ls" --username root --password islands  --wait-stdout -- ls "/" """)
                return
            except Exception as e:
                print(e.output.strip().decode("utf8"))
                sleep(15)
                continue

class InvalidPathFormat(Exception):
    pass


class IslandsImageNotFound(Exception):
    pass

# Attach guest additions spell:
# vboxmanage storageattach <vmname> --storagectl IDE --port 1 --device 0 --type dvddrive --medium /Applications/VirtualBox.app/Contents/MacOS/VBoxGuestAdditions.iso
