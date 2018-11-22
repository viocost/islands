from threading import Thread
from downloader import Downloader as Dl
from installer_exceptions import IslandSetupError

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

    def run_setup_command(self, command):
        res = self.setup.run(command)
        if res["error"]:
            self.error(res["result"])
            raise IslandSetupError(res["result"])

    def after_vbox_download(self):
        try:
            pass
            # self.run_setup_command("mount_vbox_distro")
            self.message("Mounted. Installing")
            # self.run_setup_command("install_vbox")
            # self.message("Installed. Unmounting vbox distro")
            # self.run_setup_command("unmount_vbox_distro")
            # self.message("Unmounted. Removing distro")
            # self.run_setup_command("delete_vbox_distro")
            self.complete("Done.")
        except Exception:
            pass

    def install(self):
        try:
            self.message("Downloading virtualbox...")

            # init progress bar for download

            # start download

            #run_setup_command("download_vbox")
            self.message("Download complete. Mounting...")

        except IslandSetupError:
            self.error("Virtualbox installation didn't successfully finish. "
                       "Please try again...")

