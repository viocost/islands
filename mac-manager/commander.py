

class Commander:
    """This class contains all possible commands for executing in cmd or shell depending on OS"""

    __start_vm = "{vboxmanage} startvm {vmname} {headless}"
    __shutdown_vm = "{vboxmanage} controlvm {vmname} acpipowerbutton"
    __poweroff_vm = "{vboxmanage} controlvm {vmname} poweroff"
    __ip_a = '{vboxmanage} guestcontrol {vmname} run --exe "/sbin/ip" --username {username} --password {password}  --wait-stdout -- ip a'
    __vboxmanage_version = "{vboxmanage} -v"


    def __init__(self, config, os):
        self.config = config
        self.os = os

    def start_vm(self, headless=True):
        headless = "--type headless" if headless else ""
        return self.__start_vm.format(
            vboxmanage=self.config['vboxmanage'],
            vmname=self.config['vmname'],
            headless=headless
        )

    def poweroff_vm(self):
        return self.__poweroff_vm.format(
            vboxmanage=self.config['vboxmanage'],
            vmname=self.config['vmname']
        )

    def shutdown_vm(self):
        return self.__shutdown_vm.format(
            vboxmanage=self.config['vboxmanage'],
            vmname=self.config['vmname']
        )


    def vboxmanage_version(self):
        return self.__vboxmanage_version.format(
            vboxmanage=self.config['vboxmanage']
        )


    # Config commands

    # def get_island_ip(self):
    #     '{vboxmanage} guestcontrol Island run --exe "/sbin/ip" '
    #     '--username root --password islands  --wait-stdout -- ip a  | grep eth1'.format(
    #     #     vboxmanage=self.__config["vboxmanage"]))
    #     pass
    #



    def is_vbox_up_to_date(self):
        #"{vboxmanage} -v".format(vboxmanage=self.__config['vboxmanage'])
        pass


    def is_islands_vm_exist(self):

            # "{vboxmanage} list vms | "
            #                          "grep  \\\"{vmname}\\\" ".format(vboxmanage=self.__config["vboxmanage"], vmname=self.__config['vmname']))
            #
            #
        pass


    # VBOX install commands
    def mount_vbox_distro(self):
        pass

    def install_vbox(self):
        pass



    def uninstall_vbox(self):
        pass


    def unmount_vbox_distro(self):
        pass

    def delete_vbox_distro(self):
        pass



    # VM install commands
    def ls_on_guest(self):
        pass


    def import_vm(self, path_to_image):
        pass

    def is_vboxnet0_exist(self):
        """Command to request configuration for vboxnet0 host only adapter
           If error returned - adapter does not exist
        """
        #"{vboxmanage} hostonlyif ipconfig vboxnet0".format(vboxmanage=self.config['vboxmanage'])
        pass

    def create_vboxnet0(self):
        #"{vboxmanage} hostonlyif create".format(vboxmanage=self.config['vboxmanage']
        pass


    def setup_shared_folder(self):
        # "{vboxmanage} sharedfolder add Island "
        # "--name islandsData -hostpath {hostpath} -automount".format(vboxmanage=self.config['vboxmanage'],
        #                                                            hostpath=fullpath))
        pass


    def insert_guest_additions(self):
        # "{vboxmanage} storageattach Island "
        # "--storagectl IDE --port 1 --device 0 "
        # "--type dvddrive "
        # "--medium /Applications/VirtualBox.app/Contents/MacOS/VBoxGuestAdditions.iso".format(
        #     vboxmanage=self.config['vboxmanage'])
        pass

    def setup_port_forwarding(self):
        # '{vboxmanage} controlvm   Island natpf1 "r1, tcp, 127.0.0.1, {port},'
        # ' {island_ip}, 4000"'.format(vboxmanage=self.config["vboxmanage"],
        #                              port=port,
        #                              island_ip=island_ip))
        pass

    def onvm_get_setup_script(self):
        # """{vboxmanage} guestcontrol Island run --exe "/usr/bin/wget" --username root --password islands --wait-stdout --wait-stderr -- wget "https://raw.githubusercontent.com/viocost/islands/dev/installer/vbox_full_setup.sh" -O "/root/isetup.sh" """.format(
        #     vboxmanage=self.config['vboxmanage']))
        pass


    def onvm_chmodx_install_script(self):
        # """{vboxmanage} guestcontrol Island run --exe "/bin/chmod" --username root --password islands --wait-stdout --wait-stderr -- chmod +x /root/isetup.sh """.format(vboxmanage=self.config['vboxmanage'])))
        pass

    def onvm_launch_setup_script(self):

        #"""{vboxmanage} guestcontrol Island run --exe "/bin/bash" --username root --password islands --wait-stdout --wait-stderr -- bash /root/isetup.sh -b dev""".format(vboxmanage=self.config['vboxmanage']),
        #    on_data=on_data, on_error=on_data)
        pass








class LinuxCommands:
    pass

class WindowsCommands:
    pass



class MACCommands:
    """

    """

    def __init__(self, config):
        self.config = config


    def start_vm(self, headless=True):
        pass

    def power_off_vm(self):
        pass

    def shutdown_vm(self):
        pass


    # Config commands

    def get_island_ip(self):
        # '{vboxmanage} guestcontrol Island run --exe "/sbin/ip" '
        # '--username root --password islands  --wait-stdout -- ip a  | grep eth1'.format(
        #     vboxmanage=self.__config["vboxmanage"]))
        pass

    def is_vbox_installed(self):
        #"{vboxmanage} -v".format(vboxmanage=self.__config['vboxmanage'])
        pass


    def is_vbox_up_to_date(self):
        #"{vboxmanage} -v".format(vboxmanage=self.__config['vboxmanage'])
        pass


    def is_islands_vm_exist(self):

            # "{vboxmanage} list vms | "
            #                          "grep  \\\"{vmname}\\\" ".format(vboxmanage=self.__config["vboxmanage"], vmname=self.__config['vmname']))
            #
            #
        pass


    # VBOX install commands
    def mount_vbox_distro(self):
        pass

    def install_vbox(self):
        pass



    def uninstall_vbox(self):
        pass


    def unmount_vbox_distro(self):
        pass

    def delete_vbox_distro(self):
        pass



    # VM install commands
    def ls_on_guest(self):
        pass


    def import_vm(self, path_to_image):
        pass

    def is_vboxnet0_exist(self):
        """Command to request configuration for vboxnet0 host only adapter
           If error returned - adapter does not exist
        """
        #"{vboxmanage} hostonlyif ipconfig vboxnet0".format(vboxmanage=self.config['vboxmanage'])
        pass

    def create_vboxnet0(self):
        #"{vboxmanage} hostonlyif create".format(vboxmanage=self.config['vboxmanage']
        pass


    def setup_shared_folder(self):
        # "{vboxmanage} sharedfolder add Island "
        # "--name islandsData -hostpath {hostpath} -automount".format(vboxmanage=self.config['vboxmanage'],
        #                                                            hostpath=fullpath))
        pass


    def insert_guest_additions(self):
        # "{vboxmanage} storageattach Island "
        # "--storagectl IDE --port 1 --device 0 "
        # "--type dvddrive "
        # "--medium /Applications/VirtualBox.app/Contents/MacOS/VBoxGuestAdditions.iso".format(
        #     vboxmanage=self.config['vboxmanage'])
        pass

    def setup_port_forwarding(self):
        # '{vboxmanage} controlvm   Island natpf1 "r1, tcp, 127.0.0.1, {port},'
        # ' {island_ip}, 4000"'.format(vboxmanage=self.config["vboxmanage"],
        #                              port=port,
        #                              island_ip=island_ip))
        pass

    def onvm_get_setup_script(self):
        # """{vboxmanage} guestcontrol Island run --exe "/usr/bin/wget" --username root --password islands --wait-stdout --wait-stderr -- wget "https://raw.githubusercontent.com/viocost/islands/dev/installer/vbox_full_setup.sh" -O "/root/isetup.sh" """.format(
        #     vboxmanage=self.config['vboxmanage']))
        pass


    def onvm_chmodx_install_script(self):
        # """{vboxmanage} guestcontrol Island run --exe "/bin/chmod" --username root --password islands --wait-stdout --wait-stderr -- chmod +x /root/isetup.sh """.format(vboxmanage=self.config['vboxmanage'])))
        pass

    def onvm_launch_setup_script(self):

        #"""{vboxmanage} guestcontrol Island run --exe "/bin/bash" --username root --password islands --wait-stdout --wait-stderr -- bash /root/isetup.sh -b dev""".format(vboxmanage=self.config['vboxmanage']),
        #    on_data=on_data, on_error=on_data)
        pass







class InitException(Exception):
    pass







