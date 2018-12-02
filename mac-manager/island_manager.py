import re
from threading import Thread
import time
from executor import ShellExecutor as Executor


class IslandManager:

    def __init__(self, config, commander):
        self.config = config
        self.commander = commander

    """ Main API methods """

    def launch_island(self):
        if not self.is_running():
            # start island
            # emit state launching
            # await for completeness
            # emit state launched
            return Executor.exec_sync(self.commander.start_vm())

    def is_starting_up(self):
        return False

    def stop_island(self):
        if self.is_running():
            return Executor.exec_sync(self.commander.shutdown_vm())


    def restart_island(self):
        if self.is_running():
            stop_res = Executor.exec_sync(self.commander.poweroff_vm())
            assert stop_res[0] == 0
            return Executor.exec_sync(self.commander.start_vm())

    def is_running(self):
        res = Executor.exec_sync(self.commander.is_running())
        running_ptrn = re.compile(r"^(?=.*State)(?=.*running)(?=.*since).+")
        return res[0] == 0 and running_ptrn.search(res[1]) is not None


    def get_vboxmanage_path(self):
        return self.config['vboxmanage']

    def get_vmname(self):
        return self.config['vmname']

    def get_vmid(self):
        return self.config['vmid']

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






