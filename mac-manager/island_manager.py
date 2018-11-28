import re
from threading import Thread
import time
from executor import ShellExecutor as Executor


class IslandManager:

    def __init__(self, config):
        self.__config = config

    """ Main API methods """

    def launch_island(self):
        if not self.is_running():
            # start island
            # emit state launching
            # await for completeness
            # emit state launched

            return Executor.exec_sync(self.__launch_cmd())

    def is_starting_up(self):
        return False

    def stop_island(self):
        if self.is_running():
            return Executor.exec_sync(self.__stop_cmd())[1]


    def restart_island(self):
        if self.is_running():
            stop_res = Executor.exec_sync(self.stop_island())
            assert stop_res[0] == 0
            return Executor.exec_sync(self.__launch_cmd())


    def is_running(self):
        running_ptrn = re.compile(r"^(?=.*State)(?=.*running)(?=.*since).+")
        res = Executor.exec_sync(self.__is_vm_running_cmd())
        return res[0] == 0 and running_ptrn.search(res[1]) is not None

    def get_vboxmanage_path(self):
        return self.__config['vboxmanage']

    def get_vmname(self):
        return self.__config['vmname']

    def get_vmid(self):
        return self.__config['vmid']

    def await_island_startup(self, window, time_limit_sec):
        def worker():
            start = time.time()
            while time.time() - start <= time_limit_sec:
                if self.is_running():
                    window.state_changed.emit()
                    return
        thread = Thread(target=worker)
        thread.start()


    def emit_islands_current_state(self, window):
        if self.is_running():
            window.current_state.emit("running")

        elif self.is_starting_up():
            window.current_state.emit("starting_up")
            #self.island_manager.await_island_startup(self, 20)
        else:
            window.current_state.emit("not_running")






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





