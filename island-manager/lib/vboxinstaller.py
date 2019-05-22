from threading import Thread
from lib.downloader import Downloader as Dl
from lib.exceptions import IslandSetupError
from lib.executor import ShellExecutor as Executor
from lib.exceptions import CmdExecutionError
from lib.util import get_full_path
from os import path

import sys

if sys.platform == 'linux':
    from os import getuid

import logging
log = logging.getLogger(__name__)

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
                 update=False,
                 on_root_password_request=None):
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
        self.on_root_password_request=on_root_password_request
        self.path_to_vbox_distr = None

    def start(self):
        self.message("Installing virtualbox...")
        self.thread = Thread(target=self.install)
        self.thread.start()
        log.debug("Thread started")

    def root_password_received_resume(self, password):
        self.thread = Thread(target=self._linux_install_proceed, args=(password,))
        self.thread.start()
        log.debug("Thread started")

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
                raise UnsupportedPlatform("Virtualbox setup: invalid platform name or unsupported platform: %s" % sys.platform)
        except CmdExecutionError as e:
            error_message = "CmdExecutionError.\nReturn code: {retcode}" \
                            "\nstderr: {stderr}" \
                            "\nstdout: {stdout}".format(retcode=e.args[0], stderr=e.args[1], stdout=e.args[2])
            self.error(msg=error_message, size=16)
            log.error("CMD EXECUTION ERROR: %s " %  error_message)
        except Exception as e:
            error_message = "Virtualbox installation didn't successfully finish:\nError: {error} Please try again...".format(error=str(e), size=16)
            self.error(error_message)
            log.error(error_message)

    def mac_install(self):
        self.init_progres_bar("Downloading virtualbox...")
        # start download
        path_to_vbox_distr = Dl.get(url=self.config["vbox_download"],
                                    dest_path=path.expandvars(self.config["downloads_path"]),
                                    on_update=self.update_progres_bar)
        self.finalize_progres_bar()
        self.message("Download completed. Mounting...")
        #path_to_image = self.config["downloads_path"] + self.config["vbox_installer_name"]
        self.mount_vbox_distro(path_to_vbox_distr)  # OS SPECIFIC!!!
        if self.update:
            self.uninstall_vbox()
            self.message("Virtualbox old version is uninstalled")
        self.message("Mounted")
        self.message("Installing Virtualbox")
        self._install_vbox_dar_win(path_to_vbox_distr)
        self.message("Installed. Unmounting vbox distro")
        self.unmount_vbox_distro(self.config["vbox_distro_mountpoint"])
        self.message("Unmounted. Removing distro")
        self.delete_vbox_distro(path_to_vbox_distr)
        self.message("Distro removed.")
        self.complete(True, "")

    def win_install(self):
        self.init_progres_bar("Downloading virtualbox...")
        # start download
        path_to_vbox_distr = Dl.get(url=self.config["vbox_download"],
                                    dest_path=path.expandvars(self.config["downloads_path"]),
                                    on_update=self.update_progres_bar)
        self.finalize_progres_bar()
        self.message("Download completed. Installing...")
        self._install_vbox_dar_win(path_to_vbox_distr)
        self.message("Instalation complete!")
        self.complete(True, "")

    def linux_install(self):
        try:
            self._linux_install_download()
            self._linux_install_proceed()
        except Exception as e:
            self.complete(False, str(e))
            log.error("Install error: %s" % str(e))
            


    def _linux_install_proceed(self, passwd=None):
        """
        Assuming that vbox installer is already downloaded
        :param passwd:
        :return:
        """
        self.message("Running virtualbox installation script...")
        if self.path_to_vbox_distr is None or not path.exists(self.path_to_vbox_distr):
            log.error("Vbox installer not found. Aborting...")
            return

        prefix = ""
        if getuid() != 0:
            if passwd is None:
                # signal here and return
                if not self.on_root_password_request:
                    log.debug("User is not root")
                    self.error("Virtualbox installation requires root privileges. Run as root using 'sudo'")
                else:
                    self.message("Root password is required")
                    self.on_root_password_request()
                return


        log.debug("VBOX install: all prerequisites checked. Continuing...")

        try:
            Executor.exec_sync(self.cmd.make_executable(self.path_to_vbox_distr))
            self._install_vbox_linux(self.path_to_vbox_distr, passwd)
            self.complete(True, "Virtualbox installed successfully.")
        except CmdExecutionError as e:
            if "password" in e.args[2]:
                self.error("Root password error")
                self.on_root_password_request()
            else:
                self.complete(False, "Virtualbox installation failed")
        except Exception as e:
            log.error("GOT VBOX INSTALL EXCEPTION: %s" % str(e))
            self.error("Virtualbox installation failed: %s " % str(e))

        # self.delete_vbox_distro(path_to_vbox_distr)
        # self.message("Distro removed.")

    def _linux_install_download(self):
        log.debug("Downloading virtualbox")
        self.init_progres_bar("Downloading virtualbox...")
        self.path_to_vbox_distr = Dl.get(url=self.config["vbox_download"],
                                         dest_path=get_full_path(self.config["downloads_path"]),
                                         on_update=self.update_progres_bar)
        self.finalize_progres_bar()
        self.message("Download completed. Installing...")

    @check_output
    def mount_vbox_distro(self, path_to_installer):
        return Executor.exec_sync(self.cmd.mount_vbox_distro(path_to_installer))

    @check_output
    def _install_vbox_linux(self, path_to_installer, passwd=""):
        return Executor.exec_stream_as_root(path_to_installer, self.message, self.error, passwd)

    @check_output
    def _install_vbox_dar_win(self, path_to_installer):
        """
        Same procedure for MACOS and windows
        :param path_to_installer:
        :return:
        """
        return Executor.exec_stream(self.cmd.install_vbox(path_to_installer), self.message, self.error)



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
