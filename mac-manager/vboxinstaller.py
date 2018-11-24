from threading import Thread
from downloader import Downloader as Dl
from installer_exceptions import IslandSetupError
from executor import ShellExecutor as Executor
from installer_exceptions import CmdExecutionError


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
            # init progress bar for download
            self.init_progres_bar("Downloading virtualbox...")
            # start download
            Dl.get(url=self.config["vbox_download"],
                   filename=self.config["vbox_installer_name"],
                   on_update=self.update_progres_bar)
            self.finalize_progres_bar()
            self.message("Download complete. Mounting...")
            self.mount_vbox_distro()
            if self.update:
                self.uninstall_vbox()
                self.message("Virtualbox old version is uninstalled")

            self.message("Mounted, installing virtualbox")
            self.install_vbox()
            self.message("Installed. Unmounting vbox distro")
            self.unmount_vbox_distro()
            self.message("Unmounted. Removing distro")
            self.delete_vbox_distro()
            self.message("Distro removed.")
            self.complete()

        except CmdExecutionError as e:
            error_message = "CmdExecutionError.\nReturn code: {retcode}" \
                            "\nstderr: {stderr}" \
                            "\nstdout: {stdout}".format(retcode=e.args[0], stderr=e.args[1], stdout=e.args[2])
            self.error(msg=error_message, size=16)
        except Exception as e:
            self.error("Virtualbox installation didn't successfully finish:\nError: {error}"
                       "Please try again...".format(error=str(e)), size=16)



    @check_output
    def mount_vbox_distro(self):
        return Executor.exec_sync("hdiutil attach ~/Downloads/{imagename} -mountpoint ~/VirtualBox"
                                       .format(imagename=self.config["vbox_installer_name"]))

    @check_output
    def install_vbox(self):
        return Executor.exec_stream(
            """osascript -e 'do shell script "installer -pkg {mpuntpoint}VirtualBox.pkg -target / " with administrator privileges' """.format(
                mpuntpoint=self.config['vbox_distro_mountpoint']), self.message, self.message
        )

    @check_output
    def uninstall_vbox(self):
        return Executor.exec_sync(
            """osascript -e 'do shell script "{mpuntpoint}VirtualBox_Uninstall.tool --unattended" with administrator privileges' """.format(
                mpuntpoint=self.config['vbox_distro_mountpoint'])
        )

    @check_output
    def unmount_vbox_distro(self):
        return Executor.exec_sync(
            "hdiutil detach {mountpoint}".format(mountpoint=self.config["vbox_distro_mountpoint"]))

    @check_output
    def delete_vbox_distro(self):
        return Executor.exec_sync("rm -rf ~/virtualbox.dmg")

