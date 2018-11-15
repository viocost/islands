import re
import hashlib
from threading import Thread
from executor import ShellExecutor as Executor
from time import sleep


from os import path, makedirs, environ


class IslandSetup():

    def __init__(self, config):

        self.vm_installer = None
        self.vbox_installer = None
        self.__config = config
        self.commands = {
            "download_vbox": self.download_vbox,
            "mount_vbox_distro": self.mount_vbox_distro,
            "install_vbox": self.install_vbox,
            "unmount_vbox_distro": self.unmount_vbox_distro,
            "delete_vbox_distro": self.delete_vbox_distro,
        }

    # Initializes vm installer in separate thread and starts it
    def run_vm_installer(self, *args, **kwargs):
        self.vm_installer = VMInstaller(self, *args, **kwargs)
        self.vm_installer.start()

    def run_vbox_installer(self, *args, **kwargs):
        self.vbox_installer = VBoxInstaller(*args, **kwargs)
        self.vbox_installer.start()

    # Runs arbitrary command from the set of predefined commands
    # Return result of command execution or error
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
        res =  Executor.exec("curl {link} >> ~/Downloads/virtualbox.dmg ".format(
            link=self.__config["vbox_download"]
        ))
        print("Download complete: " + str(res))
        return res

    def mount_vbox_distro(self):
        res = Executor.exec("hdiutil attach ~/Downloads/virtualbox.dmg -mountpoint ~/VirtualBox")
        print("Image mounted")
        return res

    def install_vbox(self):
        res = Executor.exec(
            """osascript -e 'do shell script "installer -pkg ~/VirtualBox/VirtualBox.pkg -target / " with administrator privileges' """
        )
        print("Installation finished: \n" + res)

    def unmount_vbox_distro(self):
        res = Executor.exec("hdiutil detach ~/VirtualBox")
        print("Image unmounted")
        return res

    def delete_vbox_distro(self):
        res = Executor.exec("rm -rf ~/virtualbox.dmg")
        return res

    def install_virtualbox(self):
        try:
          pass
        except Exception as e:
            print("Error")
            print(e)



    # DOWNLOAD AND INSTALL VM METHODS
    # Download Islands vm from specified source
    # Destination is app directory
    def download_vm(self):
        return Executor.exec("curl -L {link} >> ~/Downloads/Island.ova".format(
            link=self.__config["vm_download"]))

    # Imports downloaded vm
    # Image must be downloaded into app root directory
    def import_vm(self, path_to_image):
        if not path.exists(path_to_image):
            raise IslandsImageNotFound

        return Executor.exec("""osascript -e 'do shell script "vboxmanage import {path}  " with administrator privileges' """.format(path=path_to_image))

    # This assumes that VM is already imported
    # There is no way to check whether vboxnet0 interface exists,
    # so we issue erroneous command to modify it
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

    def get_islands_ip(self):
        res = Executor.exec('vboxmanage guestcontrol Island run --exe "/sbin/ip" '
                            '--username root --password islands  --wait-stdout -- ip a  | grep eth1')
        return re.search(r'(\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b)', res).group()

    def setup_port_forwarding(self, port):
        island_ip = self.get_islands_ip()
        if not island_ip:
            raise PortForwardingException("Was not able to determine ip address of Islands VM")
        res = Executor.exec('vboxmanage controlvm   Island natpf1 "r1, tcp, 127.0.0.1, {port},'
                      ' {island_ip}, 4000"'.format(port=port, island_ip=island_ip))
        self.__config["local_access"] = "<a href='http://localhost:{port}'>http://localhost:{port}</a>".format(port=port)
        self.__config.save()
        return res

    # Sets up a shareed folder for the imported vm
    def setup_shared_folder(self, data_folder_path = "~/islandsData"):
        fullpath = self.parse_shared_folder_path(data_folder_path)
        if not path.exists(fullpath):
            makedirs(fullpath)
        return Executor.exec("vboxmanage sharedfolder add Island "
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
        if not self.is_virtualbox_installed():
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


class VBoxInstaller:
    def __init__(self, config, setup, on_message, on_complete, on_error):
        self.thread = None
        self.setup = setup
        self.config = config
        self.message = on_message
        self.complete = on_complete
        self.error = on_error

    def start(self):
        self.thread = Thread(target=self.install)
        self.thread.start()

    def install(self):
        def run_setup_command(command):
            res = self.setup.run(command)
            if res["error"]:
                self.error(res["result"])
                raise IslandSetupError(res["result"])
        try:
            self.message("Downloading virtualbox...")
            run_setup_command("download_vbox")
            self.message("Download complete. Mounting...")
            run_setup_command("mount_vbox_distro")
            self.message("Mounted. Installing")
            run_setup_command("install_vbox")
            self.message("Installed. Unmounting vbox distro")
            run_setup_command("unmount_vbox_distro")
            self.message("Unmounted. Removing distro")
            run_setup_command("delete_vbox_distro")
            self.complete("Done.")
        except IslandSetupError:
            self.error("Virtualbox installation didn't successfully finish. "
                       "Please try again...")


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

class InvalidPathFormat(Exception):
    pass

class PortForwardingException(Exception):
    pass

class IslandsImageNotFound(Exception):
    pass

class IslandSetupError(Exception):
    pass

# Attach guest additions spell:
# vboxmanage storageattach <vmname> --storagectl IDE --port 1 --device 0 --type dvddrive --medium /Applications/VirtualBox.app/Contents/MacOS/VBoxGuestAdditions.iso

# Port forwarding spell:
# vboxmanage controlvm   Island natpf1 "r1, tcp, 127.0.0.1, 4000, 192.168.56.102, 4000"