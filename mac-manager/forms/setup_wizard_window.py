
from os import environ
from PyQt5.QtWidgets import QMessageBox as QM, QWizard, QFileDialog
from PyQt5.QtCore import QObject, pyqtSignal
from forms.setup_wizard_ui_setup import Ui_IslandSetupWizzard as UI_setup


class SetupWizzardWindow:
    def __init__(self, config,  island_manager, setup):
        self.working = False
        self.config = config
        self.setup = setup
        self.ui = UI_setup()
        self.window = QWizard()
        self.ui.setupUi(self.window)
        self.ui.button_install_vbox.setDefault(True)
        self.island_manager = island_manager
        self.prepare_handlers()


    # Clear window outputs
    def show(self):
        self.reset_consoles()
        self.vboxpage_prepare_text()
        self.window.show()

    def reset_consoles(self):
        self.ui.textBrowser.setText("")
        self.ui.vm_install_output_console.setText("")

    def vboxpage_prepare_text(self):
        self.ui.textBrowser.append(SetupMessages.checking_vbox())
        if self.setup.is_virtualbox_installed():
            self.ui.textBrowser.append(SetupMessages.virtualbox_found())
            self.ui.textBrowser.append(SetupMessages.vb_installed_instructions())
            self.prepare_vm_setup_page()
        else:
            self.ui.textBrowser.append(SetupMessages.virtualbox_not_installed())
            self.ui.textBrowser.append(SetupMessages.vb_not_installed_instructions())
        self.scroll_to_end(self.ui.textBrowser)

    def scroll_to_end(self, console):
        sb = console.verticalScrollBar()
        sb.setValue(sb.maximum())

    def set_handlers(self):
        pass

    def on_close(self, handler):
        def close(event):
            res = QM.question(self.window, "Quit", "Quit setup wizzard?", QM.Yes | QM.No)
            if res == QM.Yes:
                event.accept()
                handler()
            else:
                event.ignore()


    def set_vbox_checker(self, handler):
        def is_complete():
            return handler()
        self.window.page(0).isComplete = is_complete
        self.ui.textBrowser.append("<p><b style='color:red;'>Hello world</b></p>")

    def set_vbox_page_buttons_enabled(self, value):
        self.ui.button_install_vbox.setEnabled(value)
        self.ui.button_path_to_vboxmanage.setEnabled(value)

    def set_vm_page_buttons_enabled(self, value):
        self.ui.button_select_data_path.setEnabled(value)
        self.ui.button_import_ova.setEnabled(value)
        self.ui.button_install_islands.setEnabled(value)

    def set_islands_vm_checker(self, handler):
        def is_complete():
            return handler()
        self.window.page(1).isComplete = is_complete

    def prepare_handlers(self):
        # BUTTONS' HANDLERS
        self.ui.button_install_vbox.clicked.connect(self.process_vbox_install)
        self.ui.button_select_data_path.clicked.connect(self.select_data_folder)
        self.ui.button_import_ova.clicked.connect(self.select_islands_image)
        self.ui.button_install_islands.clicked.connect(self.download_install_islands)

        # SIGNALS
        # ***
    # Appends text to a given console
    def process_output(self, data, output_type="regular", font_size=12):
        colors = {
            "regular": "black",
            "success": "green",
            "error": "red",
            "warning": "orange"
        }
        console = self.ui.vm_install_output_console
        if output_type not in colors:
            raise KeyError("Invalid output type")
        console.append("<p style='color:{color}; font_size:{font_size}'> {data} </p>"
                       .format(color=colors[output_type], font_size=font_size, data=data))



    # Opens select foldedialog
    def select_data_folder(self):
        f_dialog = QFileDialog()
        f_dialog.setFileMode(QFileDialog.Directory)
        res = f_dialog.getExistingDirectory(self.window)
        if res:
            self.ui.data_folder_path.setText(res)

    def select_islands_image(self):
        res = QFileDialog.getOpenFileName(self.window, "Select Islands image", environ["HOME"], "Virtual Appliance (*.ova)")
        if res == ('', ''):
            print("Cancelled")
            return
        proceed = QM.question(self.window, "Islands setup", "{vmname} will be installed and configured. "
                                        "Continue?".format(vmname=res[0].split("/")[-1]), QM.Yes | QM.No)
        if proceed == QM.Yes:
            t = self.ui.data_folder_path.text()
            print(t)
            self.proceed_vm_install(data_path=t, download=False, vm_image_path=res[0])
            # Launch thread

    def download_install_islands(self):
        self.proceed_vm_install()

    def proceed_vm_install(self, data_path, download=False, vm_image_path=None):
        self.set_vm_page_buttons_enabled(False)
        self.window.button(QWizard.BackButton).setEnabled(False)

        def on_message(msg):
            if msg:
                self.ui.vm_install_output_console.append('<p style="color: blue"> {msg} </p>'.format(msg=msg))

        def on_complete(msg):
            self.set_vm_page_buttons_enabled(False)
            self.window.button(QWizard.BackButton).setEnabled(False)
            self.ui.vm_install_output_console.append('<p style="color: green"> {msg} </p>'.format(msg=msg))
            self.ui.vm_install_output_console.append('<p style="color: green; font-size: 16px;"> '
                                                     'Click "continue" to proceed >> </p>'.format(msg=msg))
            self.window.page(1).completeChanged.emit()

        def on_error(err):
            self.set_vm_page_buttons_enabled(True)
            self.window.button(QWizard.BackButton).setEnabled(True)
            if err:
                self.ui.vm_install_output_console.append('<p style="color: red"> {msg} </p>'.format(msg=str(err)))

        self.setup.run_vm_installer(on_message=on_message,
                                    on_complete=on_complete,
                                    on_error=on_error,
                                    download=download,
                                    image_path=vm_image_path,
                                    data_path=data_path)

    def prepare_vm_setup_page(self):
        console = self.ui.vm_install_output_console
        if self.setup.is_islands_vm_exist():
            console.append(SetupMessages.vm_found())
            console.append(SetupMessages.vm_found_instructions())
        else:
            console.append(SetupMessages.vm_not_found())
            console.append(SetupMessages.vm_not_found_instructions())
        self.set_vm_page_buttons_enabled(not self.setup.is_islands_vm_exist())

    def process_vbox_install(self):
        console = self.ui.textBrowser
        def run_setup_command(command):
            res = self.setup.run(command)
            if res["error"]:
                console.append("<p style='color: red'>{errmsg}</p>".format(errmsg=res["result"]))
                raise IslandSetupError(res["result"])
        try:
            self.set_vbox_page_buttons_enabled(False)
            console.append("<p>Downloading virtualbox...</p>")
            run_setup_command("download_vbox")
            console.append("<p>Download complete. Mounting...</p>")
            run_setup_command("mount_vbox_distro")
            console.append("<p>Mounted. Installing</p>")
            run_setup_command("install_vbox")
            console.append("<p>Installed. Unmounting vbox distro</p>")
            run_setup_command("unmount_vbox_distro")
            console.append("<p>Unmounted. Removing distro</p>")
            run_setup_command("delete_vbox_distro")
            console.append("<p>Done.</p>")
            console.append(SetupMessages.virtualbox_installed())
            console.append(SetupMessages.vb_installed_instructions())
            self.scroll_to_end(console)
            self.prepare_vm_setup_page()
        except IslandSetupError:
            console.append("<p style='color: orange; font-size: 20px'>"
                           "<br><br>Virtualbox installation didn't successfully finish. "
                           "Please try again...</p>")
        self.set_vbox_page_buttons_enabled(not self.setup.is_virtualbox_installed())
        self.window.page(0).completeChanged.emit()


class SetupMessages:
    @staticmethod
    def virtualbox_found():
        return """  
                <p><b style='color:green; font-size:18px; margin-bottom:20px;'>Virtualbox found</b></p>
             """

    @staticmethod
    def virtualbox_installed():
        return """  
                <p><b style='color:green; font-size:18px; margin-bottom:20px;'>Virtualbox successfully installed!</b></p>
             """

    @staticmethod
    def virtualbox_not_installed():
        return """  
            <p><b style='color:orange; font-size:18px; margin-bottom:20px;'>Virtualbox not installed</b></p>
                 """

    @staticmethod
    def vb_installed_instructions():
        return """
            <p>Please click <b>"Continue"</b> </p>
        """

    @staticmethod
    def vb_not_installed_instructions():
        return """  
         <p style='font-size=15px'>Click <b>Install virtualbox</b> to download/install virtualbox automatically  </p>          
         <p style='font-size=12px'> If you have virtualbox already installed and 
         you know the location of <b>vboxmanage</b> file: please
          click <b>Path to vboxmanage</b> and select vboxmanage file</p> 
         """

    @staticmethod
    def dloading_vb():
        return"""
        <p>Downloading virtualbox...</p>
        """

    @staticmethod
    def installing_vb():
        return """
                <p>Installing virtualbox...</p>
        """

    @staticmethod
    def checking_vbox():
        return """
            <p>Checking virtualbox installation...</p>
        """

    @staticmethod
    def vm_found():
        return """
             <p><b style='color:green; font-size:18px; margin-bottom:20px;'>Islands virtual machine found!</b></p>
        """

    @staticmethod
    def vm_not_found():
        return """
             <p><b style='color:orange; font-size:18px; margin-bottom:20px;'>Islands virtual machine not found!</b></p>
        """

    @staticmethod
    def vm_found_instructions():
        return """  
         <br><p style='font-size=15px'>Please click <b>Continue</b></p> 
         """


    @staticmethod
    def vm_not_found_instructions():
        return """  
         <p style='font-size=15px'>Click <b>Install Islands VM</b> to download/install Islands automatically  </p>
         <br>          
         <p style='font-size=12px'> If you have previously downloaded Islands VM in OVA format 
          please click <b>Import OVA</b> and select islands OVA image file</p>
                             
         """

class IslandSetupError(Exception):
    pass

