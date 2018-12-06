from forms.main_window_ui_setup import Ui_MainWindow
from forms.setup_wizard_window import SetupWizardWindow as SetupWindow
from PyQt5.QtWidgets import QMainWindow, QFileDialog, QMessageBox as QM
from PyQt5.QtCore import QObject, pyqtSignal
from util import get_version, get_full_path
from island_states import IslandStates as States
import re

class MainWindow(QObject):

    current_state = pyqtSignal(object)
    processing = pyqtSignal()
    state_changed = pyqtSignal()

    def __init__(self, config, islands_manager, setup):
        QObject.__init__(self)
        self.config = config
        self.setup = setup
        self.island_manager = islands_manager
        self.window = QMainWindow()
        self.states = self.prepare_states()
        self.ui = Ui_MainWindow()
        self.ui.setupUi(self.window)
        self.assign_handlers()
        self.set_state(States.UNKNOWN)
        self.setup_window = None
        self.refresh_island_status()
        self.set_main_window_title()
        self.load_settings()


    def show(self):
        self.window.show()

    def hide(self):
        self.window.hide()

    def refresh_island_status(self):
        try:
            if self.setup.is_setup_required():
                self.set_state(States.SETUP_REQUIRED)
            else:
                self.island_manager.emit_islands_current_state(self.state_emitter)
        except Exception as e:
            print(e)
            self.set_state(States.UNKNOWN)

    def prepare_states(self):
        return {
            States.SETUP_REQUIRED: self.set_setup_required,
            States.RUNNING: self.set_running,
            States.NOT_RUNNING: self.set_not_running,
            States.STARTING_UP: self.set_starting_up,
            States.SHUTTING_DOWN: self.set_shutting_down,
            States.RESTARTING: self.set_restarting,
            States.UNKNOWN: self.set_unknown
        }

    def request_to_run_setup(self):
        message = "Islands setup is required. Would you like to launch it now?"
        res = QM.question(self.window, '', message, QM.Yes | QM.No)
        if res == QM.Yes:
            self.launch_setup()


    def load_settings(self):
        self.ui.vmnameLineEdit.setText(self.config['vmname'])
        self.ui.vboxmanagePathLineEdit.setText(get_full_path(self.config['vboxmanage']))
        self.ui.dfLineEdit.setText(get_full_path(self.config['data_folder']))

    # Connects UI element with handler
    def assign_handlers(self):
        self.ui.launchIslandButton.clicked.connect(self.get_main_control_handler("launch"))
        self.ui.shutdownIslandButton.clicked.connect(self.get_main_control_handler("stop"))
        self.ui.restartIslandButton.clicked.connect(self.get_main_control_handler("restart"))
        self.ui.button_launch_setup.clicked.connect(self.launch_setup)
        self.current_state.connect(self.set_state)
        self.ui.actionInfo.triggered.connect(self.show_app_info)
        self.ui.actionClose.triggered.connect(self.on_close)
        self.ui.actionMinimize_2.triggered.connect(self.minimize_main_window)
        self.processing.connect(self.set_working)
        self.state_changed.connect(self.refresh_island_status)
        self.ui.vmnameSave.clicked.connect(self.save_vmname)
        self.ui.vmnameDefault.clicked.connect(self.restore_default_vmname)
        self.ui.vboxmanageDefault.clicked.connect(self.restore_default_vboxmanage_path)
        self.ui.vboxmanageSave.clicked.connect(self.save_vboxmanage_path)
        self.ui.vmnameLineEdit.textChanged.connect(self.vmname_process_change)
        self.ui.vboxmanagePathLineEdit.textChanged.connect(self.vboxmanage_process_change)
        self.ui.dfLineEdit.textChanged.connect(self.df_process_change)
        self.ui.vboxmanageSelectPath.clicked.connect(self.vboxmanage_select_path)
        self.ui.dfSelectPath.clicked.connect(self.df_select_path)
        self.ui.dfDefault.clicked.connect(self.restore_default_data_folder_path)
        self.ui.dfSave.clicked.connect(self.save_datafolder_path)

    def state_emitter(self, state):
        self.current_state.emit(state)

    def get_main_control_handler(self, cmd):
        cmds = {
            "launch": "launch_island",
            "stop": "stop_island",
            "restart": "restart_island",
        }
        params = {
            "Quiet": "",
            "Normal": ", False",
            "Soft": "",
            "Force": ", True"
        }
        def get_param(cmd):
            if cmd == "launch" or cmd == "restart":
                return params[self.ui.launchMode.currentText()]
            elif cmd == "stop":
                return params[self.ui.stopMode.currentText()]

        if cmd not in cmds:
            raise KeyError

        def handler():
            self.set_working()
            try:
                print("Command: %s" % cmd)
                param = get_param(cmd)
                command = ("self.island_manager.{cmd}(self.state_emitter{param})".format(
                    cmd=cmds[cmd],
                    param=param if param else ""))
                res = eval(command)
                print(res)
            except Exception as e:
                print("Error occured")
                print(e)
        return handler

    def launch_setup(self):
        self.setup_window = SetupWindow(self.window, self.config, self.island_manager, self.setup)
        self.set_setup_window_onclose_handler(self.setup_window)
        self.setup_window.set_vbox_checker(self.setup.is_vbox_set_up)
        self.setup_window.set_islands_vm_checker(self.setup.is_islands_vm_exist)
        res = self.setup_window.exec()
        print("WIZARD RESULT IS {res}".format(res=res))
        self.refresh_island_status()




    def set_setup_window_onclose_handler(self, window):
        def handler():
            self.refresh_island_status()
        window.on_close(handler)

    def set_state(self, state):
        if state not in self.states:
            raise KeyError("Invalid main window state.")
        self.states[state]()

    """MENU HANDLERS"""
    def minimize_main_window(self):
        print("Minimizing")
        self.window.showMinimized()

    def show_app_info(self):
        QM.about(self.window, "", "Islands Virtual Machine Manager\nVersion: %s" % get_version())

    def on_close(self):
        self.window.close()


    def set_main_window_title(self):
        self.window.setWindowTitle("Island Manager %s" % "v"+get_version())

    """END"""

    """ STATE SETTERS """
    def set_setup_required(self):
        self.ui.island_access_label.setVisible(False)
        self.ui.island_access_address.setVisible(False)
        reason = self.setup.is_setup_required()
        self.ui.islandStatus.setText("Setup required")
        self.ui.islandStatus.setStyleSheet('color: orange')
        self.ui.restartIslandButton.setEnabled(False)
        self.ui.shutdownIslandButton.setEnabled(False)
        self.ui.launchIslandButton.setEnabled(False)
        self.ui.groupBox.setEnabled(True)
        self.ui.setup_required_reason.setText(reason)
        self.ui.groupBox.show()
        self.ui.launchMode.setEnabled(False)
        self.ui.stopMode.setEnabled(False)


    def set_running(self):
        if self.config["local_access"]:
            self.ui.island_access_label.setVisible(True)
            self.ui.island_access_address.setVisible(True)
            self.ui.island_access_address.setText(self.config["local_access"])
            self.ui.island_admin_access_label.setVisible(True)
            self.ui.island_admin_access_address.setText(self.config["local_access_admin"])
            self.ui.island_admin_access_address.setVisible(True)
        self.ui.islandStatus.setText("Running")
        self.ui.islandStatus.setStyleSheet('color: green')
        self.ui.restartIslandButton.setEnabled(True)
        self.ui.shutdownIslandButton.setEnabled(True)
        self.ui.launchIslandButton.setEnabled(False)
        self.ui.groupBox.setEnabled(False)
        self.ui.groupBox.hide()
        self.ui.launchMode.setEnabled(False)
        self.ui.stopMode.setEnabled(True)

    def set_starting_up(self):
        self.ui.island_access_label.setVisible(False)
        self.ui.island_access_address.setVisible(False)
        self.ui.island_admin_access_label.setVisible(False)
        self.ui.island_admin_access_address.setVisible(False)
        self.ui.islandStatus.setText("Starting up...")
        self.ui.islandStatus.setStyleSheet('color: blue')
        self.ui.restartIslandButton.setEnabled(False)
        self.ui.shutdownIslandButton.setEnabled(False)
        self.ui.launchIslandButton.setEnabled(False)
        self.ui.groupBox.setEnabled(False)
        self.ui.groupBox.hide()
        self.ui.launchMode.setEnabled(False)
        self.ui.stopMode.setEnabled(False)

    def set_shutting_down(self):
        self.ui.islandStatus.setText("Shutting down...")
        self.ui.islandStatus.setStyleSheet('color: orange')
        self.ui.island_access_label.setVisible(False)
        self.ui.island_access_address.setVisible(False)
        self.ui.island_admin_access_label.setVisible(False)
        self.ui.island_admin_access_address.setVisible(False)
        self.ui.groupBox.setEnabled(False)
        self.ui.groupBox.hide()
        self.set_working()


    def set_not_running(self):
        self.ui.island_access_label.setVisible(False)
        self.ui.island_access_address.setVisible(False)
        self.ui.island_admin_access_label.setVisible(False)
        self.ui.island_admin_access_address.setVisible(False)
        self.ui.islandStatus.setText("Not running")
        self.ui.islandStatus.setStyleSheet('color: red')
        self.ui.restartIslandButton.setEnabled(False)
        self.ui.shutdownIslandButton.setEnabled(False)
        self.ui.launchIslandButton.setEnabled(True)
        self.ui.groupBox.setEnabled(False)
        self.ui.groupBox.hide()
        self.ui.launchMode.setEnabled(True)
        self.ui.stopMode.setEnabled(False)

    def set_unknown(self):
        self.ui.island_access_label.setVisible(False)
        self.ui.island_access_address.setVisible(False)
        self.ui.island_admin_access_label.setVisible(False)
        self.ui.island_admin_access_address.setVisible(False)
        self.ui.islandStatus.setText("Unknown")
        self.ui.islandStatus.setStyleSheet('color: gray')
        self.ui.restartIslandButton.setEnabled(False)
        self.ui.shutdownIslandButton.setEnabled(False)
        self.ui.launchIslandButton.setEnabled(False)
        self.ui.groupBox.setEnabled(False)
        self.ui.groupBox.hide()
        self.ui.launchMode.setEnabled(False)
        self.ui.stopMode.setEnabled(False)

    def set_restarting(self):
        self.ui.island_access_label.setVisible(False)
        self.ui.island_access_address.setVisible(False)
        self.ui.island_admin_access_label.setVisible(False)
        self.ui.island_admin_access_address.setVisible(False)
        self.ui.islandStatus.setText("Restarting...")
        self.ui.islandStatus.setStyleSheet('color: blue')
        self.set_working()


    def set_working(self):
        self.ui.restartIslandButton.setEnabled(False)
        self.ui.shutdownIslandButton.setEnabled(False)
        self.ui.launchIslandButton.setEnabled(False)
        self.ui.launchMode.setEnabled(False)
        self.ui.stopMode.setEnabled(False)

    """ ~ END STATES """


    def restore_default_vmname(self):
        self.config.restore_default("vmname")
        self.ui.vmnameLineEdit.setText(self.config["vmname"])
        self.ui.vmnameSave.setEnabled(False)
        self.refresh_island_status()

    def restore_default_vboxmanage_path(self):
        self.config.restore_default("vboxmanage")
        self.ui.vboxmanagePathLineEdit.setText(get_full_path(self.config["vboxmanage"]))
        self.ui.vboxmanageSave.setEnabled(False)
        self.refresh_island_status()

    def restore_default_data_folder_path(self):
        #Check if custom path is different from default
        #confirm
        if self.config.is_default("data_folder"):
            print("Already default")
            return
        res = QM.question(self.window,
                          "Confirm",
                          "This will require stopping Islands. Continue?",
                          QM.Yes | QM.No)
        if res == QM.No:
            return
        print("Restoring default data folder")
        self.island_manager.restore_default_df_path()
        self.ui.dfLineEdit.setText(get_full_path(self.config['data_folder']))
        self.state_changed.emit()

    def save_datafolder_path(self):
        res = QM.question(self.window,
                          "Confirm",
                          "This will require stopping Islands. Continue?",
                          QM.Yes | QM.No)
        if res == QM.No:
            return
        print("saving new data folder")
        self.island_manager.set_new_datafolder(self.ui.dfLineEdit.text())
        self.ui.dfLineEdit.setText(get_full_path(self.config['data_folder']))
        self.state_changed.emit()

    def save_vboxmanage_path(self):
        try:
            self.setup.set_vboxmanage_path(self.ui.vboxmanagePathLineEdit.text())
            self.refresh_island_status()
        except Exception as e:
            self.show_notification("Error setting vboxmanage path: %s" % str(e))

    def save_vmname(self):
        val = self.ui.vmnameLineEdit.text().strip()
        ptrn = re.compile('[A-z]+')
        if not ptrn.match(val):
            self.show_notification("Invalid name for virtual machine")
            return
        self.config['vmname'] = val
        self.config.save()
        self.ui.vmnameSave.setEnabled(False)
        self.refresh_island_status()



    def show_notification(self, text):
        QM.warning(self.window, None, "Warning", text, buttons=QM.Ok)


    def vmname_process_change(self):
        self.ui.vmnameSave.setEnabled(
            self.ui.vmnameLineEdit.text() != self.config['vmname']
        )


    def vboxmanage_process_change(self):
        self.ui.vboxmanageSave.setEnabled(
            self.ui.vboxmanagePathLineEdit.text() != get_full_path(self.config['vboxmanage'])
        )

    def df_process_change(self):
        self.ui.dfSave.setEnabled(
            self.ui.dfLineEdit.text() != get_full_path(get_full_path(self.config['data_folder']))
        )

    def vboxmanage_select_path(self):

        res = QFileDialog.getOpenFileName(parent=self.window,
                                          filter='vboxmanage.exe',
                                          directory=get_full_path(self.config['homedir']))
        if res != ('', ''):
            self.config['vboxmanage'] = get_full_path(res[0])
            self.config.save()
            self.ui.vboxmanagePathLineEdit.setText(get_full_path(self.config['vboxmanage']))

    def df_select_path(self):
        f_dialog = QFileDialog()
        f_dialog.setFileMode(QFileDialog.Directory)
        res = f_dialog.getExistingDirectory(self.window)
        if res:
            self.ui.dfLineEdit.setText(get_full_path(res))