from sys import platform

class Commander:
    """This class contains all possible commands for executing in cmd or shell depending on OS"""

    """CMD TEMPLATES"""
    __start_vm = "{vboxmanage} startvm {vmname} {headless}"
    __shutdown_vm = "{vboxmanage} controlvm {vmname} acpipowerbutton"
    __poweroff_vm = "{vboxmanage} controlvm {vmname} poweroff"
    __ip_a = '{vboxmanage} guestcontrol {vmname} run --exe "/sbin/ip" --username {username} --password {password}  --wait-stdout -- ip a'
    __vboxmanage_version = "{vboxmanage} -v"
    __list_vms = "{vboxmanage} list vms"
    __vminfo = "{vboxmanage} showvminfo {vmname}"
    __uninstall_vbox = {
        "darwin": """osascript -e 'do shell script "{mpuntpoint}VirtualBox_Uninstall.tool --unattended" with administrator privileges' """
    }
    __install_vbox = {
        "darwin": """osascript -e 'do shell script "installer -pkg {mpuntpoint}VirtualBox.pkg -target / " with administrator privileges' """,
        "win32": "{distrpath} --silent"
    }
    __delete_vbox_distr = {
        "darwin": "rm -rf {distrpath}",
        "win32": "DEL {distrpath} /F /S"
    }

    __mount_vbox_distro = {
        "darwin": "hdiutil attach {distrpath} -mountpoint {mountpoint}"
    }

    __unmount_vbox_distro = {
        "darwin": "hdiutil detach {mountpoint}"
    }





    def __init__(self, config, platform):
        self.config = config
        self.platform = platform

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


    def listvms(self):
        return self.__list_vms.format(
            vboxmanage=self.config['vboxmanage']
        )

    def vminfo(self):
        return self.__vminfo.format(
            vboxmanage=self.config['vboxmanage'],
            vmname=self.config['vmname']
        )

    def install_vbox(self, path_to_installer):
        mountpoint = "" if 'vbox_distro_mountpoint' not in self.config else self.config['vbox_distro_mountpoint']
        return self.__install_vbox[platform].format(mountpoint=mountpoint,
                                                    distrpath=path_to_installer)

    def uninstall_vbox(self):
        return self.__uninstall_vbox[platform].format(mountpoint=self.config['vbox_distro_mountpoint'])

    def delete_vbox_distro(self, distrpath):
        return self.__delete_vbox_distr[platform].format(distrpath=distrpath)

    def unmount_vbox_distro(self, distrpath):
        return self.__unmount_vbox_distro[platform].format(
            mountpoint=self.config["vbox_distro_mountpoint"],
            distrpath=distrpath
        )

    def mount_vbox_distro(self, distrpath):
        return self.__mount_vbox_distro[platform].format(
            mountpoint=self.config["vbox_distro_mountpoint"],
            distrpath=distrpath
        )

