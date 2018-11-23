from threading import Thread
from executor import ShellExecutor as Executor
from time import sleep
from downloader import Downloader as Dl


class VMInstaller:
    def __init__(self,
                 setup,
                 on_message,
                 on_complete,
                 on_error,
                 data_path,
                 init_progres_bar,
                 update_progres_bar,
                 config,
                 finalize_progres_bar,
                 download=False,
                 image_path=None,
                 port=False):
        self.thread = None
        self.setup = setup
        self.message = on_message
        self.complete = on_complete
        self.error = on_error
        self.config = config
        self.init_progres_bar = init_progres_bar
        self.update_progres_bar = update_progres_bar
        self.finalize_progres_bar = finalize_progres_bar
        self.download = download
        self.data_path = data_path
        self.image_path = image_path
        self.port = port
        if not download:
            assert(bool(image_path))

    def start(self):
        self.thread = Thread(target=self.install)
        self.thread.start()

    def install(self):
        try:
            if self.download:
                self.init_progres_bar("Downloading Islands Virtual Machine...")
                self.download_vm()
                self.finalize_progres_bar()
                self.message("Download complete")
            self.message("Importing VM...")
            self.setup.import_vm(self.image_path if self.image_path else "~/Downloads/Island.ova", self.message, self.error)
            self.message("Image imported. Configuring...")
            self.setup.setup_host_only_adapter()
            self.message("Network configured..")
            self.setup.setup_shared_folder(self.data_path)
            self.message("Data folder set up... Launching VM")
            # Start machine... Wait until controlvm is available then run scripts
            print(Executor.exec_sync("vboxmanage startvm Island"))
            self.message("VM started...")
            Executor.exec_sync("vboxmanage storageattach Island --storagectl IDE --port 1 --device 0 --type dvddrive --medium /Applications/VirtualBox.app/Contents/MacOS/VBoxGuestAdditions.iso")
            self.message("Guest additions mounted... Waiting for initial setup. \n"
                            "This will take a while! Do not turn off your computer.")
            self.wait_guest_additions()
            sleep(3)
            self.wait_guest_additions()
            if self.port:
                self.setup.setup_port_forwarding(self.port)
            self.message("Guest additions are installed. Fetching Islands setup script..")
            res = Executor.exec_sync("""vboxmanage guestcontrol Island run --exe "/usr/bin/wget" --username root --password islands --wait-stdout --wait-stderr -- wget "https://raw.githubusercontent.com/viocost/islands/dev/installer/vbox_full_setup.sh" -O "/root/isetup.sh" """)
            print(Executor.exec_sync("""vboxmanage guestcontrol Island run --exe "/bin/chmod" --username root --password islands --wait-stdout --wait-stderr -- chmod +x /root/isetup.sh """))
            self.message("Installation in progress. This step takes a while... Grab some tea")
            print("Launching setup script")
            Executor.exec_stream("""vboxmanage guestcontrol Island run --exe "/bin/bash" --username root --password islands --wait-stdout --wait-stderr -- bash /root/isetup.sh -b dev""",
                                 on_data=self.message, on_error=self.error, verbose=True)
            self.message("Setup completed. Restarting Islands...")

            sleep(1)
            Executor.exec_sync("""vboxmanage controlvm Island acpipowerbutton""")

            for i in range(10):
                sleep(3)
                res = Executor.exec_sync("""vboxmanage startvm Island --type headless  """)
                if res[0] == 0:
                    self.complete("Islands Virtual Machine successfully installed.")
                    return
            self.error(Exception("VM launch unsuccessfull"))

        except Exception as e:
            print("VMinstaller exception: " + str(e))
            #print(e.output.strip().decode("utf8"))
            self.error(e)

    # TODO async
    # DOWNLOAD AND INSTALL VM METHODS
    # Download Islands vm from specified source
    # Destination is app directory
    def download_vm(self):
        Dl.get(url=self.config['vm_download'],
               filename=self.config["vm_image_name"],
               on_update=self.update_progres_bar)


    def wait_guest_additions(self):
        while True:

            res = Executor.exec_sync("""vboxmanage guestcontrol Island run --exe "/bin/ls" --username root --password islands  --wait-stdout -- ls "/" """)
            if res[0] == 0:
                print("Looks like guestcontrol is available on Islands VM! Returning...")
                return
            print("Awaiting for initial setup to complete..")
            sleep(15)
