from forms.main_window_ui_setup import Ui_MainWindow
from forms.setup_wizard_window import SetupWizzardWindow as SetupWindow
from PyQt5.QtWidgets import QMainWindow, QMessageBox as QM


class MainWindow:
    def __init__(self, config, islands_manager, setup):
        self.config = config
        self.setup = setup
        self.island_manager = islands_manager
        self.window = QMainWindow()
        self.states = self.prepare_states()
        self.ui = Ui_MainWindow()
        self.ui.setupUi(self.window)
        self.assign_handlers()
        self.set_state("unknown")
        self.setup_window = None
        self.refresh_island_status()


    def show(self):
        self.window.show()

    def hide(self):
        self.window.hide()

    def refresh_island_status(self):
        try:
            if self.setup.is_setup_required():
                self.set_state("setup_required")

            elif self.island_manager.is_running():
                self.set_state("running")
            else:
                self.set_state("not_running")
        except Exception as e:
            print(e)
            self.set_state("unknown")

    def prepare_states(self):
        return {
            "setup_required": self.set_setup_required,
            "running": self.set_running,
            "not_running": self.set_not_running,
            "unknown": self.set_unknown
        }

    def request_to_run_setup(self):
        message = "Islands setup is required. Would you like to launch it now?"
        res = QM.question(self.window, '', message, QM.Yes | QM.No)
        if res == QM.Yes:
            self.launch_setup()


    # Connects UI element with handler
    def assign_handlers(self):
        self.ui.launchIslandButton.clicked.connect(self.get_main_control_handler("launch"))
        self.ui.shutdownIslandButton.clicked.connect(self.get_main_control_handler("stop"))
        self.ui.restartIslandButton.clicked.connect(self.get_main_control_handler("restart"))
        self.ui.button_launch_setup.clicked.connect(self.launch_setup)

    def get_main_control_handler(self, cmd):
        cmds = {
            "launch": "launch_island",
            "stop": "stop_island",
            "restart": "restart_island",
        }
        if cmd not in cmds:
            raise KeyError

        def handler():
            try:
                print("Command: %s" % cmd)
                res = eval("self.island_manager.%s()" % (cmds[cmd]))
                print(res)
            except Exception as e:
                print(e)
            self.refresh_island_status()

        return handler

    def launch_setup(self):
        self.setup_window = SetupWindow(self.window, self.config, self.island_manager, self.setup)
        self.set_setup_window_onclose_handler(self.setup_window)
        self.setup_window.set_vbox_checker(self.setup.is_virtualbox_installed)
        self.setup_window.set_islands_vm_checker(self.setup.is_islands_vm_exist)

        res = self.setup_window.exec()
        print("WIZZARD RESULT IS {res}".format(res=res))
        self.refresh_island_status()


    def set_setup_window_onclose_handler(self, window):
        def handler():
            self.refresh_island_status()
        window.on_close(handler)

    def set_state(self, state):
        if state not in self.states:
            raise KeyError("Invalid main window state.")
        self.states[state]()


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


    def set_running(self):
        if self.config["local_access"]:
            self.ui.island_access_label.setVisible(True)
            self.ui.island_access_address.setVisible(True)
            self.ui.island_access_address.setText(self.config["local_access"])
        self.ui.islandStatus.setText("Running")
        self.ui.islandStatus.setStyleSheet('color: green')
        self.ui.restartIslandButton.setEnabled(True)
        self.ui.shutdownIslandButton.setEnabled(True)
        self.ui.launchIslandButton.setEnabled(False)
        self.ui.groupBox.setEnabled(False)
        self.ui.groupBox.hide()

    def set_not_running(self):
        self.ui.island_access_label.setVisible(False)
        self.ui.island_access_address.setVisible(False)
        self.ui.islandStatus.setText("Not running")
        self.ui.islandStatus.setStyleSheet('color: red')
        self.ui.restartIslandButton.setEnabled(False)
        self.ui.shutdownIslandButton.setEnabled(False)
        self.ui.launchIslandButton.setEnabled(True)
        self.ui.groupBox.setEnabled(False)
        self.ui.groupBox.hide()

    def set_unknown(self):
        self.ui.island_access_label.setVisible(False)
        self.ui.island_access_address.setVisible(False)
        self.ui.islandStatus.setText("Unknown")
        self.ui.islandStatus.setStyleSheet('color: gray')
        self.ui.restartIslandButton.setEnabled(False)
        self.ui.shutdownIslandButton.setEnabled(False)
        self.ui.launchIslandButton.setEnabled(False)
        self.ui.groupBox.setEnabled(False)
        self.ui.groupBox.hide()
    """ ~ END STATES """

