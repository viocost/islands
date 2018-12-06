from threading import Thread
from downloader import Downloader as Dl
from installer_exceptions import IslandSetupError
from executor import ShellExecutor as Executor
from installer_exceptions import CmdExecutionError
from os import path
import sys
import time


def check_output(func):
    def wrapper(*args, **kwargs):
        res = func(*args, **kwargs)
        if res[0] != 0:
            raise CmdExecutionError(*res)
        return res
    return wrapper

class VBoxInstaller:
    def __init__(self, config,
                 setup,
                 on_message,
                 on_complete,
                 on_error,
                 init_progres_bar,
                 update_progres_bar,
                 finalize_progres_bar,
                 update=False):
        self.thread = None
        self.setup = setup
        self.cmd = setup.cmd
        self.config = config
        self.message = on_message
        self.complete = on_complete
        self.error = on_error
        self.init_progres_bar = init_progres_bar
        self.update_progres_bar = update_progres_bar
        self.finalize_progres_bar = finalize_progres_bar
        self.update = update

    def start(self):
        self.thread = Thread(target=self.install)
        self.thread.start()

    def run_setup_command(self, *args, **kwargs):
        res = self.setup.run(args, kwargs)
        if res["error"]:
            self.error(res["result"])
            raise IslandSetupError(res["result"])

    def install(self):
        try:
            if sys.platform == "darwin":
                self.mac_install()
            elif sys.platform == "win32":
                self.win_install()
            elif sys.platform == "linux":
                self.linux_install()
            else:
                pass
                #raise UnsupportedPlatform("Virtualbox setup: invalid platform name or unsupported platform: %s" % sys.platform)
        except CmdExecutionError as e:
            error_message = "CmdExecutionError.\nReturn code: {retcode}" \
                            "\nstderr: {stderr}" \
                            "\nstdout: {stdout}".format(retcode=e.args[0], stderr=e.args[1], stdout=e.args[2])
            self.error(msg=error_message, size=16)
        except Exception as e:
            self.error("Virtualbox installation didn't successfully finish:\nError: {error}"
                       "Please try again...".format(error=str(e)), size=16)

    def mac_install(self):
        self.init_progres_bar("Downloading virtualbox...")
        # start download
        path_to_vbox_distr = Dl.get(url=self.config["vbox_download"],
                                    dest_path=path.expandvars(self.config["downloads_path"]),
                                    on_update=self.update_progres_bar)
        self.finalize_progres_bar()
        self.message("Download complete. Mounting...")
        #path_to_image = self.config["downloads_path"] + self.config["vbox_installer_name"]
        self.mount_vbox_distro(path_to_vbox_distr)  # OS SPECIFIC!!!
        if self.update:
            self.uninstall_vbox()
            self.message("Virtualbox old version is uninstalled")
        self.message("Mounted")
        self.message("Installing Virtualbox")
        self.install_vbox(path_to_vbox_distr)
        self.message("Installed. Unmounting vbox distro")
        self.unmount_vbox_distro(self.config["vbox_distro_mountpoint"])
        self.message("Unmounted. Removing distro")
        self.delete_vbox_distro(path_to_vbox_distr)
        self.message("Distro removed.")
        self.complete()

    def win_install(self):
        self.init_progres_bar("Downloading virtualbox...")
        # start download
        path_to_vbox_distr = Dl.get(url=self.config["vbox_download"],
                                    dest_path=path.expandvars(self.config["downloads_path"]),
                                    on_update=self.update_progres_bar)
        self.finalize_progres_bar()
        self.message("Download complete. Installing...")
        self.install_vbox(path_to_vbox_distr)
        self.message("Instalation complete!")
        self.delete_vbox_distro(path_to_vbox_distr)
        self.message("Distro removed.")
        self.complete()

    def linux_install(self):
        pass



    @check_output
    def mount_vbox_distro(self, path_to_installer):
        return Executor.exec_sync(self.cmd.mount_vbox_distro(path_to_installer))

    @check_output
    def install_vbox(self, path_to_installer):
        cmd = self.cmd.install_vbox(path_to_installer)
        return Executor.exec_stream(cmd, self.message, self.error)

    @check_output
    def uninstall_vbox(self):
        return Executor.exec_sync(self.cmd.uninstall_vbox())

    @check_output
    def unmount_vbox_distro(self, mountpoint):
        return Executor.exec_sync(self.cmd.unmount_vbox_distro(mountpoint))

    @check_output
    def delete_vbox_distro(self, distrpath):
        return Executor.exec_sync(self.cmd.delete_vbox_distro(distrpath))


class UnsupportedPlatform(Exception):
    pass