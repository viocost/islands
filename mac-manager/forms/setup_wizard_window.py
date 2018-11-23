from os import environ
from PyQt5.QtWidgets import QMessageBox as QM, QWizard, QFileDialog
from PyQt5.QtCore import QObject, pyqtSignal, Qt
from forms.setup_wizard_ui_setup import Ui_IslandSetupWizzard as UI_setup
from PyQt5.QtGui import QTextCursor
import util

class SetupWizardWindow(QObject):

    # This signal will be emitted whenever there is something to append to output screen
    # First parameter is message,
    # second parameter is console index: 0 - first page, 1 - second page
    #
    output = pyqtSignal(str, int)
    progress = pyqtSignal(int, str, str, str, str, bool)
    update_elements = pyqtSignal()
    vbox_instal_complete = pyqtSignal()

    def __init__(self, parent, config,  island_manager, setup):
        QObject.__init__(self)

        self.working = False
        self.config = config
        self.setup = setup
        self.ui = UI_setup()
        self.window = QWizard(parent)
        self.ui.setupUi(self.window)
        self.ui.button_install_vbox.setDefault(True)
        self.island_manager = island_manager
        self.prepare_handlers()

        self.consoles = {
            0: self.ui.vbox_setup_output_console,
            1: self.ui.vm_install_output_console
        }

    # Handler for output signal
    def appender(self, msg, console_index):

        if console_index not in self.consoles:
            raise InvalidConsoleIndex
        self.consoles[console_index].append(msg)
        self.scroll_to_end(self.ui.vm_install_output_console)


    # TODO Refactor
    def progress_bar_handler(self, console_index, action, title="", progress_in_percents="", ratio="", success=True):

        """This function initializes, updates and finalizes ASCII progress bar
        Args:
            console_index        -- window to output. Defined in constructor.
            action               -- can be init, update, and finalize
                                    init appends new progress bar to console
                                    update - rewrites previous line and sets updated values for progress and ratio
                                    finalize - rewrites last line in color depending  on success value
            title                -- line right above progress bar
            progress_in_percents -- exactly what it means
            ratio                -- optional and will appear as is on the right of the progress bar

            success              -- indicates whether operation succeeded. Only matters on finalize
        """
        if console_index not in self.consoles:
            raise KeyError

        def construct_progress_bar():
            multiple = .3
            fill = '='
            void = ' '
            fills = int(multiple*int(progress_in_percents))
            whitespaces = int(multiple*100) - fills
            print(fills, whitespaces)
            return '<span style="font-family: Monaco"><b> {:>3}% </b><span style="white-space: pre;">|{}>{}|</span> </span>{}'.format(progress_in_percents, fill*fills,
                                        void * whitespaces, ratio)

        def init_progress_bar():
            self.consoles[console_index].append('<br><b>{title}</b>'.format(title=title))
            self.consoles[console_index].append(construct_progress_bar())


        def update_progress_bar():
            b = construct_progress_bar()
            cursor = self.consoles[console_index].textCursor()

            # Move cursor to the beginning of the line
            cursor.movePosition(QTextCursor.StartOfLine)
            cursor.movePosition(QTextCursor.EndOfBlock, QTextCursor.KeepAnchor)
            cursor.removeSelectedText()
            cursor.insertHtml(b)
            # Select until the end
            # delete
            # write new update line

            print("Current position: %s" % str(cursor.position()))

        def finalize_progress_bar():
            color, content = ("green", "OK") if success else ("red", "ERROR")
            final_word = "<p style='color: {color}'>{content}</p>".format(color=color, content=content)
            self.consoles[console_index].append(final_word)

        if action == "update":
            update_progress_bar()
        elif action == 'init':
            init_progress_bar()
        elif action == 'finalize':
            finalize_progress_bar()

    def prepare_handlers(self):
        # BUTTONS' HANDLERS
        self.ui.button_install_vbox.clicked.connect(self.process_vbox_install)
        self.ui.button_select_data_path.clicked.connect(self.select_data_folder)
        self.ui.button_import_ova.clicked.connect(self.select_islands_image)
        self.ui.button_install_islands.clicked.connect(self.download_install_islands)
        self.window.keyPressEvent = self.key_press_handler()
        self.output.connect(self.appender)
        self.progress.connect(self.progress_bar_handler)
        self.update_elements.connect(self.update_ui_state)
        self.vbox_instal_complete.connect(self.prepare_vm_setup_page)

        #TEST
        self.ui.test_button.clicked.connect(self.test_output)

    #TEST
    def test_output(self):

        from time import sleep
        from threading import Thread

        def run_test():

            self.progress.emit(0, "init", "Testing progress bar", "0", "", True)
            for i in range(101):
                self.progress.emit(0, "update", "", str(i), '%d/100' % i, True)
                sleep(.05)

            self.progress.emit(0, "finalize", "", "", "", True)
        p = Thread(target=run_test,  group=None)
        p.start()
    #END TEST

    def key_press_handler(self):
        def handler(event):
            if event.key() == Qt.Key_Escape:
                install_complete = self.setup.is_vbox_set_up and self.setup.is_islands_vm_exist()
                message = "Setup is not complete yet. Setup process will be interrupted. " \
                    if not install_complete else ""
                message += "Quit setup wizzard?"
                res = QM.question(self.window, "Quit", message, QM.Yes | QM.No)
                if res == QM.Yes:
                    self.window.close()
        return handler

    # Clear window outputs
    def exec(self):
        self.reset_consoles()
        self.vboxpage_prepare_text()
        self.update_ui_state()
        return self.window.exec()


    def reset_consoles(self):
        self.ui.vbox_setup_output_console.setText("")
        self.ui.vm_install_output_console.setText("")



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

    def set_islands_vm_checker(self, handler):
        def is_complete():
            return handler()
        self.window.page(1).isComplete = is_complete

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

    # Starts islands install process with choose image option
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

    # Starts islands install process with image download option
    def download_install_islands(self):
        data_path = self.ui.data_folder_path.text()
        self.proceed_vm_install(data_path=data_path, download=True)

    # Given install options sets up output handlers and
    # passes options to installer
    def proceed_vm_install(self, data_path, download=False, vm_image_path=None):
        print (self.config['vboxmanage'])
        self.ui.button_select_data_path.setEnabled(False)
        self.ui.button_install_islands.setEnabled(False)
        self.ui.button_import_ova.setEnabled(False)
        self.ui.data_folder_path.setEnabled(False)
        self.ui.button_select_data_path.setEnabled(False)
        self.ui.port_forwarding_enabled.setEnabled(False)
        self.ui.local_port.setEnabled(False)

        self.window.button(QWizard.BackButton).setEnabled(False)


        port = self.ui.local_port.text() if self.ui.port_forwarding_enabled.isChecked() else False
        self.setup.run_vm_installer(on_message=self.get_on_message_handler(console=1),
                                    on_complete=self.get_on_complete_handler(msg="Click \"continue\" to proceed", console=1),
                                    on_error=self.get_on_error_handler(console=1),
                                    init_progres_bar=self.get_init_progress_bar_handler(console=1),
                                    update_progres_bar=self.get_update_progress_bar_handler(console=1),
                                    finalize_progres_bar=self.get_finalize_progress_bar_handler(console=1),
                                    download=download,
                                    setup=self.setup,
                                    image_path=vm_image_path,
                                    config=self.config,
                                    data_path=data_path,
                                    port=port)
        # def on_message(msg, size=12):
        #     self.output.emit('<p style="color: blue; font-size: {size}"> {msg} </p>'.format(msg=msg, size=size), 1)
        #
        # def on_complete(msg):
        #     self.output.emit('<p style="color: green;"> {msg} </p>'.format(msg=msg), 1)
        #     self.output.emit('<p style="color: green; font-size: 16px;"> '
        #                                              'Click "continue" to proceed >> </p>', 1)
        #     self.set_vm_page_buttons_enabled(False)
        #     self.window.button(QWizard.BackButton).setEnabled(False)
        #     self.window.page(1).completeChanged.emit()
        #
        # def on_error(err):
        #     self.set_vm_page_buttons_enabled(True)
        #     self.window.button(QWizard.BackButton).setEnabled(True)
        #     if err:
        #         self.ui.vm_install_output_console.append('<p style="color: red"> {msg} </p>'.format(msg=str(err)))



    def prepare_vm_setup_page(self):
        console = self.ui.vm_install_output_console
        if self.setup.is_islands_vm_exist():
            console.append(SetupMessages.vm_found())
            console.append(SetupMessages.vm_found_instructions())
        else:
            console.append(SetupMessages.vm_not_found())
            console.append(SetupMessages.vm_not_found_instructions())



    # Console event handlers
    # This handlers are used by setup installer to display the output and update status of
    # installation process
    def get_on_message_handler(self, console):
        def on_message(msg, size=12, color='blue'):
            print("GOT MESSAGE: %s" % msg)
            self.output.emit('<p style="color: color; font-size: {size}"> {msg} </p>'
                             .format(msg=msg, size=size, color=color), console)
        return on_message

    def get_on_error_handler(self, console):
        def on_errror(msg, size=12, color='red'):
            print("GOT MESSAGE: %s" % msg)
            self.output.emit('<p style="color: color; font-size: {size}"> {msg} </p>'
                             .format(msg=msg, size=size, color=color), console)
            self.update_ui_state()
        return on_errror

    def get_on_complete_handler(self, msg, console, handler = None):
        def on_complete(size=16, color='green', ):
            self.output.emit('<p style="color: {color}; font-size: {size}"> {msg} </p>'
                             .format(msg=msg, size=size, color=color), console)
            self.update_elements.emit()
            if handler:
                handler()
        return on_complete
    # Console event handlers

    # Baking progress bar handlers
    def get_init_progress_bar_handler(self, console):
        def init_progress_bar(title, size=None):
            ratio = "0/%d" % size if size is not None else ""

            self.progress_bar_handler(console_index=console,
                                      action='init',
                                      title=title,
                                      progress_in_percents="0",
                                      ratio=ratio,
                                      success=True)
        return init_progress_bar

    def get_update_progress_bar_handler(self, console):
        def update_progress_bar(progress, downloaded, total_size=None, title=None):
            ratio = "%s/%s" % (str(util.sizeof_fmt(downloaded)), str(util.sizeof_fmt(total_size))) if downloaded is not None and total_size \
                else ""
            title = title if title is not None else ""
            self.progress_bar_handler(console_index=console,
                                      action='update',
                                      title=title,
                                      progress_in_percents=str(progress),
                                      ratio=ratio,
                                      success=True)

        return update_progress_bar

    def get_finalize_progress_bar_handler(self, console):
        def finalize_progress_bar(progress=None,  downloaded=None, total_size=None, title=None):
            ratio = "%s/%s" % (str(downloaded), str(total_size)) if downloaded is not None and total_size \
                else ""
            self.progress_bar_handler(console_index=console,
                                      action='finalize',
                                      title=title,
                                      progress_in_percents=str(progress),
                                      ratio=ratio,
                                      success=True)
        return finalize_progress_bar
    # END progress bar handlers

    def process_vbox_install(self):
        self.ui.button_install_vbox.setEnabled(False)
        vbox_installed = self.setup.is_vbox_installed()

        def on_complete():
            self.vbox_instal_complete.emit()
        self.setup.run_vbox_installer(
            config=self.config,
            setup=self.setup,
            on_message=self.get_on_message_handler(console=0),
            on_complete=self.get_on_complete_handler(msg="Virtualbox is now set up. Click on \"continue\" to proceed.",
                                                     console=0,
                                                     handler=on_complete),
            init_progres_bar=self.get_init_progress_bar_handler(0),
            update_progres_bar=self.get_update_progress_bar_handler(0),
            finalize_progres_bar=self.get_finalize_progress_bar_handler(0),
            on_error=self.get_on_error_handler(console=0),
            update=vbox_installed
        )


    def vboxpage_prepare_text(self):
        self.ui.vbox_setup_output_console.append(SetupMessages.checking_vbox())
        if not self.setup.is_vbox_installed():
            self.ui.vbox_setup_output_console.append(SetupMessages.virtualbox_not_installed())
            self.ui.vbox_setup_output_console.append(SetupMessages.vb_not_installed_instructions())

        elif not self.setup.is_vbox_up_to_date():
            self.ui.vbox_setup_output_console.append(SetupMessages.virtualbox_update_required())
            self.ui.vbox_setup_output_console.append(SetupMessages.virtualbox_update_required_instructions())

        else:
            self.ui.vbox_setup_output_console.append(SetupMessages.virtualbox_found())
            self.ui.vbox_setup_output_console.append(SetupMessages.vb_installed_instructions())
            self.prepare_vm_setup_page()


    def update_ui_state(self):
        """Checks setup condition and updates ALL elements accordingly

           possible states:
           Virtualbox installed, requires update, not installed
           Active page: 1, 2, 3
           VM installed, not installed

        """
        current_page_id = self.get_active_page_id()
        vbox_installed = self.setup.is_vbox_installed()
        vbox_up_to_date = False if not vbox_installed else self.setup.is_vbox_up_to_date()
        islands_vm_installed = vbox_installed and vbox_up_to_date and \
                self.setup.is_islands_vm_exist()

        self.ui.button_install_vbox.setVisible(not (vbox_installed and vbox_up_to_date))
        self.ui.button_install_vbox.setEnabled(not (vbox_installed and vbox_up_to_date))

        if not vbox_installed:
            self.ui.button_install_vbox.setText("Install Virtualbox")
        else:
            self.ui.button_install_vbox.setText("Update Virtualbox")

        vm_install_ready = (vbox_installed
                         and vbox_up_to_date and not islands_vm_installed)
        self.ui.button_import_ova.setEnabled(vm_install_ready)
        self.ui.button_import_ova.setVisible(vm_install_ready)
        self.ui.button_install_islands.setEnabled(vm_install_ready)
        self.ui.button_install_islands.setVisible(vm_install_ready)
        self.ui.data_folder_path.setEnabled(vm_install_ready)
        self.ui.button_select_data_path.setEnabled(vm_install_ready)
        self.ui.local_port.setEnabled(vm_install_ready)
        self.ui.port_forwarding_enabled.setEnabled(vm_install_ready)
        self.window.button(QWizard.BackButton).setEnabled(not vm_install_ready or current_page_id != 0
                                                          or not islands_vm_installed)
        self.window.button(QWizard.NextButton).setEnabled((current_page_id == 0 and vbox_installed and vbox_up_to_date)
                                                          or current_page_id == 1 and islands_vm_installed)
        self.window.button(QWizard.FinishButton).setEnabled(current_page_id == 2 and vbox_installed and
                                                            vbox_up_to_date and islands_vm_installed)
        self.scroll_to_end(self.ui.vbox_setup_output_console)
        self.scroll_to_end(self.ui.vm_install_output_console)

        #self.window.page(current_page_id).completeChanged.emit()




    def get_active_page_id(self):
        return self.window.currentId()




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
    def virtualbox_update_required():
        return """  
            <p><b style='color:orange; font-size:18px; margin-bottom:20px;'>Virtualbox update required</b></p>
                 """

    @staticmethod
    def virtualbox_update_required_instructions():
        return """  
            <p style='font-size=15px'>Click <b>Update Virtualbox</b> to download and install newest version of Virtualbox automatically</p>
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



class InvalidConsoleIndex(Exception):
    pass