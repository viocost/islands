import re
from im_config import IMConfig
from subprocess import check_output


class IslandManager():
    def __init__(self):
        self.__config = IMConfig()

    def launch_island(self):
        if not self.is_running():
            return self.__exec(self.__launch_cmd())
        return "OK"

    def stop_island(self):
        if self.is_running():
            return self.__exec(self.__stop_cmd())
        return "OK"

    def restart_island(self):
        if self.is_running():
            self.__exec(self.stop_island())
            return self.__exec(self.__launch_cmd())
        return self.__exec(self.__launch_cmd())

    def is_running(self):
        running_ptrn = re.compile(r"^(?=.*State)(?=.*running)(?=.*since).+")
        res = self.__exec(self.__is_vm_running_cmd())
        print(running_ptrn.search(res.decode("utf8")) is not None)
        return running_ptrn.search(res.decode("utf8")) is not None

    def get_vboxmanage_path(self):
        return self.__config['vboxmanage']

    def get_vmname(self):
        return self.__config['vmname']

    def get_vmid(self):
        return self.__config['vmid']


    def __exec(self, cmd):
        return check_output(cmd, shell=True)

    def get_command(self, cmd):
        commands = {
            "launch": self.__launch_cmd,
            "stop": self.__stop_cmd
        }
        if cmd not in commands:
            raise KeyError
        return commands[cmd]()


    def __launch_cmd(self):
        return "{vboxmanage} startvm {vmname} --type headless".format(
            vboxmanage=self.__config['vboxmanage'],
            vmname=self.__config['vmname']
        )

    def __stop_cmd(self):
        return "{vboxmanage} controlvm {vmname} poweroff ".format(
            vboxmanage=self.__config['vboxmanage'],
            vmname=self.__config['vmname']
        )

    def __restart_cmd(self):
        return "{vboxmanage} controlvm {vmname} reset ".format(
            vboxmanage=self.__config['vboxmanage'],
            vmname=self.__config['vmname']
        )

    def __is_vm_running_cmd(self):
        return "{vboxmanage} showvminfo \"{vmname}\" | grep running || true ".format(
            vboxmanage=self.__config['vboxmanage'],
            vmname=self.__config['vmname']
        )





