import re
from threading import Thread
import time
from executor import ShellExecutor as Executor
from island_states import IslandStates as States


class IslandManager:

    def __init__(self, config, commander, setup):
        self.config = config
        self.cmd = commander
        self.setup = setup

    """ Main API methods """

    def launch_island(self, state_emitter, headless=True, timeout=80):
        def worker():
            if self.setup.is_setup_required():
                state_emitter(States.SETUP_REQUIRED)
                return
            if not self.is_running():
                state_emitter(States.STARTING_UP)
                Executor.exec_sync(self.cmd.start_vm(headless))
                t1 = time.time()
                while not self.is_boot_complete() and (time.time() - t1) < timeout:
                    if self.setup.is_setup_required():
                        state_emitter(States.SETUP_REQUIRED)
                        return
                    time.sleep(4)
                if self.is_running():
                    state_emitter(States.RUNNING)
                elif self.setup.is_setup_required():
                    state_emitter(States.SETUP_REQUIRED)
                else:
                    print("Startup error. VM hasn't started up")
                    state_emitter(States.UNKNOWN)
        t = Thread(target=worker)
        t.start()

    def is_boot_complete(self):
        res = Executor.exec_sync(self.cmd.ls_on_guest())
        if res[0] == 0:
            print("Looks like boot complete")
            return True
        else:
            return False


    def stop_island(self, state_emitter, force=False, timeout=60):
        def worker():
            if self.setup.is_setup_required():
                state_emitter(States.SETUP_REQUIRED)
                return
            if self.is_running():
                state_emitter(States.SHUTTING_DOWN)
                Executor.exec_sync(self.cmd.shutdown_vm(force))
            t1 = time.time()
            while self.is_running() and time.time() - t1 < timeout:
                if self.setup.is_setup_required():
                    state_emitter(States.SETUP_REQUIRED)
                    return
                else:
                    time.sleep(4)
            if self.setup.is_setup_required():
                state_emitter(States.SETUP_REQUIRED)
            elif not self.is_running():
                state_emitter(States.NOT_RUNNING)
            elif self.is_running():
                print("ERROR shutting down")
                state_emitter(States.RUNNING)
            else:
                print("Fatal error")
                state_emitter(States.UNKNOWN)
        t = Thread(target=worker)
        t.start()

    def restart_island(self, state_emitter, headless=True, timeout=100):
        def worker():
            if self.setup.is_setup_required():
                state_emitter(States.SETUP_REQUIRED)
                return
            state_emitter(States.RESTARTING)
            if self.is_running():
                Executor.exec_sync(self.cmd.shutdown_vm(True))
                time.sleep(1)
            Executor.exec_sync(self.cmd.start_vm(headless))
            t1 = time.time()
            while not self.is_boot_complete() and time.time() - t1 < timeout:
                if self.setup.is_setup_required():
                    state_emitter(States.SETUP_REQUIRED)
                    return
                time.sleep(4)
            if self.is_running():
                state_emitter(States.RUNNING)
            elif self.setup.is_setup_required():
                state_emitter(States.SETUP_REQUIRED)
            else:
                print("Startup error. VM hasn't started up")
                state_emitter(States.UNKNOWN)
        t = Thread(target=worker)
        t.start()
            
    def is_running(self):
        res = Executor.exec_sync(self.cmd.vminfo())
        running_ptrn = re.compile(r"(?=.*State)(?=.*running)(?=.*since).+")
        found = running_ptrn.search(res[1])
        return res[0] == 0 and found is not None

    def get_vboxmanage_path(self):
        return self.config['vboxmanage']

    def get_vmname(self):
        return self.config['vmname']

    def get_vmid(self):
        return self.config['vmid']

    def emit_islands_current_state(self, state_emitter):
        if self.is_running():
            state_emitter(States.RUNNING)
        else:
            state_emitter(States.NOT_RUNNING)
