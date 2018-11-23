from threading import Thread
from multiprocessing import Process
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
        self.thread = Thread(target=self.install, args=[self.init_progres_bar])
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

            def on_done(res):
                self.message("Mounted. Installing...")

            self.setup.mount_vbox_distro(on_data=self.message, on_error=self.error, on_done=on_done)


            # if self.update:
            #     self.run_setup_command("uninstall_vbox")
            #     self.message("Virtualbox old version is uninstalled")
            # self.run_setup_command("install_vbox")
            # self.message("Installed. Unmounting vbox distro")
            # self.run_setup_command("unmount_vbox_distro")
            # self.message("Unmounted. Removing distro")
            # self.run_setup_command("delete_vbox_distro")
            # self.complete("Done.")
        except IslandSetupError:
            self.error("Virtualbox installation didn't successfully finish. "
                       "Please try again...")

