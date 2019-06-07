import sys
from views.main_form.main_form import Ui_MainWindow
from controllers.keys_form import KeysForm
from controllers.setup_wizard_window import SetupWizardWindow as SetupWindow
from controllers.config_form import ConfigForm
from controllers.update_form import UpdateForm
from PyQt5.QtWidgets import QMainWindow,  QMessageBox as QM, QWidget
from PyQt5.QtCore import pyqtSignal, QEvent, QObject
from lib.util import get_version, is_admin_registered
from lib.island_states import IslandStates as States
from controllers.image_authoring_form import ImageAuthoringForm
from controllers.torrents_form import TorrentsForm
from lib.key_manager import KeyManager
from time import sleep
from threading import Thread

import logging

log = logging.getLogger(__name__)


class MainWindow(QMainWindow):

    current_state = pyqtSignal(object)
    processing = pyqtSignal()
    state_changed = pyqtSignal()
    focus_in = pyqtSignal()

    def __init__(self, config, island_manager, setup, torrent_manager):
        super(MainWindow, self).__init__()
        self.config = config
        self.setup = setup
        self.island_manager = island_manager
        self.states = self.prepare_states()
        self.ui = Ui_MainWindow()
        self.ui.setupUi(self)
        self.key_manager = KeyManager(self.config)
        self.assign_handlers()
        self.set_state(States.UNKNOWN)
        self.setup_window = None
        self.torrent_manager = torrent_manager
        self.refresh_island_status()
        self.set_main_window_title()
        # island status refresh counter
        self.refresh_count = 0
        log.debug("Main window controller initialized.")


    def event(self, event):
        if event.type() == QEvent.ActivationChange:
            log.debug("Focus In detected")
            self.refresh_island_status()
            return True

        return super().event(event)



    def refresh_island_status(self):
        try:
            if self.setup.is_setup_required():
                self.set_state(States.SETUP_REQUIRED)
            else:
                self.island_manager.emit_islands_current_state(self.state_emitter)
        except Exception as e:
            log.error("Error refreshing island statuus: %s" % str(e))
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
        res = QM.question(self, '', message, QM.Yes | QM.No)
        if res == QM.Yes:
            self.launch_setup()

    # Connects UI element with handler
    def assign_handlers(self):
        """
        Assigns handlers for all UI elements events
        :return:
        """
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
        self.ui.act_islandsimage_authoring.triggered.connect(self.author_image)
        self.ui.act_my_torrents.triggered.connect(self.show_my_torrents)
        self.ui.act_trusted_keys.triggered.connect(lambda: self.open_keys_form())
        self.ui.act_my_keys.triggered.connect(lambda: self.open_keys_form(True))
        self.ui.act_open_config.triggered.connect(lambda: self.open_config())
        self.ui.act_update_vm.triggered.connect(self.open_update)

    def author_image(self):
        log.debug("Opening image authoring form")
        form = ImageAuthoringForm(parent=self,
                                  key_manager=self.key_manager,
                                  config=self.config,
                                  torrent_manager=self.torrent_manager)
        form.exec()
        log.debug("Image authoring form closed")

    def state_emitter(self, state):
        """
        Given a state emits it to PYQT so it could update all UI elements accordingly.
        :param state:
        :return:
        """
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

    def open_config(self):
        log.debug("Opening")
        config = ConfigForm(self, self.config, self.setup, self.island_manager)
        config.exec()
        self.refresh_island_status()
        self.state_changed.emit()

    def open_update(self):
        log.debug("opening update form")
        update_form = UpdateForm(self, self.config, self.island_manager, self.setup)
        update_form.exec()
        self.state_changed.emit()

    def launch_setup(self):
        self.setup_window = SetupWindow(self, self.config, self.island_manager, self.setup)
        self.set_setup_window_onclose_handler(self.setup_window)
        self.setup_window.set_vbox_checker(self.setup.is_vbox_set_up)
        self.setup_window.set_islands_vm_checker(self.setup.is_islands_vm_exist)
        res = self.setup_window.exec()
        print("WIZARD RESULT IS {res}".format(res=res))
        self.refresh_island_status()

    def open_keys_form(self, is_private_keys=False):
        keys_form = KeysForm(self, self.key_manager, self.config, is_private_keys)
        keys_form.exec()

    def show_my_torrents(self):
        torrents_dialog = TorrentsForm(self, self.torrent_manager, self.config)
        torrents_dialog.exec()

    def set_setup_window_onclose_handler(self, window):
        def handler():
            self.refresh_island_status()
        window.on_close(handler)

    def set_state(self, state):
        if state not in self.states:
            raise KeyError("Invalid main window state.")
        try:
            self.states[state]()
        except Exception as e:
            log.error("Error setting state %s: %s" % (state, str(e)))

    """MENU HANDLERS"""
    def minimize_main_window(self):
        print("Minimizing")
        self.showMinimized()

    def show_app_info(self):
        pos = self.pos()
        self.show()
        QM.about(self, "", "Islands Virtual Machine Manager\nVersion: %s" % get_version())

    def on_close(self):
        self.close()

    def set_main_window_title(self):
        self.setWindowTitle("Islands Manager %s" % "v"+get_version())

    """ STATE SETTERS """
    def set_setup_required(self):
        self.ui.island_access_label.setVisible(False)
        self.ui.island_access_address.setVisible(False)
        self.ui.island_admin_access_address.setVisible(False)
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
        self.setup.update_vm_config()
        admin_exist = is_admin_registered(self.config["data_folder"])
        log.debug("admin exists: %s" % str(admin_exist))
        self.ui.island_access_label.setVisible(admin_exist)
        self.ui.island_access_address.setVisible(admin_exist)
        if self.config["local_access"]:
            self.ui.island_access_address.setText(self.get_local_access_html(self.config["local_access"]))
            self.ui.island_admin_access_address.setText(self.get_local_access_html(self.config["local_access_admin"], True))
            self.ui.island_admin_access_address.setVisible(True)
        else:
            self.ui.island_access_address.setText('<span style="color: grey; text-decoration: none">not configured</span>')
            self.ui.island_admin_access_address.setVisible(False)
            self.run_delayed_config_load()
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
        self.ui.island_admin_access_address.setVisible(False)
        self.ui.groupBox.setEnabled(False)
        self.ui.groupBox.hide()
        self.set_working()

    def set_not_running(self):
        self.ui.island_access_label.setVisible(False)
        self.ui.island_access_address.setVisible(False)
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

    def run_delayed_config_load(self):
        if self.refresh_count >= 5:
            self.refresh_count = 0
            return
        self.refresh_count += 1

        def worker():
            sleep(self.refresh_count + 1)
            self.refresh_island_status()
        thread = Thread(target=worker)
        thread.start()

    def show_notification(self, text):
        QM.warning(self, None, "Warning", text, buttons=QM.Ok)

    def get_local_access_html(self, connection_str, admin=False):
        return '<a href="{connstr}">{content}</a>'.format(
            connstr=connection_str,
            content="Admin access" if admin else connection_str
        )


