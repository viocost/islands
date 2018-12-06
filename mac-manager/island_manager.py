import re
import time
import os, sys
from threading import Thread
from util import get_full_path
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

    def restore_default_df_path(self):
        if self.is_running():
            Executor.exec_sync(self.cmd.shutdown_vm(force=True))
            time.sleep(3)
        Executor.exec_sync(self.cmd.sharedfolder_remove())
        self.config.restore_default("data_folder")
        fullpath = get_full_path(self.config["data_folder"])
        if not os.path.exists(fullpath):
            os.makedirs(fullpath)
        res = Executor.exec_sync(self.cmd.sharedfolder_setup(fullpath))
        if res[0] != 0:
            raise IslandManagerException("Datafolder reset finished with error: %s" % res[2])

    def set_new_datafolder(self, new_path):
        if self.is_running():
            Executor.exec_sync(self.cmd.shutdown_vm(force=True))
            time.sleep(3)
        new_path_full = get_full_path(new_path)
        if not os.path.exists(new_path_full):
            os.makedirs(new_path_full)
        Executor.exec_sync(self.cmd.sharedfolder_remove())
        self.config['data_folder'] = new_path_full
        self.config.save()
        res = Executor.exec_sync(self.cmd.sharedfolder_setup(new_path_full))
        if res[0] != 0:
            raise IslandManagerException("Datafolder setup finished with error: %s" % res[2])




class IslandManagerException(Exception):
    pass
