import re
from executor import ShellExecutor as Executor


class IslandManager:

    def __init__(self, config):
        self.__config = config

    """ Main API methods """
    def launch_island(self):
        if not self.is_running():
            return Executor.exec(self.__launch_cmd())
        return "OK"

    def stop_island(self):
        if self.is_running():
            return Executor.exec(self.__stop_cmd())
        return "OK"

    def restart_island(self):
        if self.is_running():
            Executor.exec(self.stop_island())
            return Executor.exec(self.__launch_cmd())
        return Executor.exec(self.__launch_cmd())

    def is_running(self):
        # running_ptrn = re.compile(r"^(?=.*State)(?=.*running)(?=.*since).+")
        res = Executor.exec_sync(self.__is_vm_running_cmd())
        return res[0] == 0

    def get_vboxmanage_path(self):
        return self.__config['vboxmanage']

    def get_vmname(self):
        return self.__config['vmname']

    def get_vmid(self):
        return self.__config['vmid']
    """END Main API"""

    """HELPERS 
    """

    def get_command(self, cmd):
        commands = {
            "launch": self.__launch_cmd,
            "stop": self.__stop_cmd
        }
        if cmd not in commands:
            raise KeyError
        return commands[cmd]()

    # HELPERS return full shell command
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





