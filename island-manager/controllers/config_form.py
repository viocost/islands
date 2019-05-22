from views.config_form.config_form import Ui_ConfigForm
from PyQt5.QtWidgets import QDialog, QFileDialog, QMessageBox as QM
from lib.util import get_full_path, show_notification, show_user_error_window, get_stack
import time
import re
import logging

log = logging.getLogger(__name__)


class ConfigForm:
    def __init__(self, parent, config, setup, islands_manager):
        self.config = config
        self.ui = Ui_ConfigForm()
        self.window = QDialog(parent)
        self.ui.setupUi(self.window)
        self.island_manager = islands_manager
        self.setup = setup
        self.load_settings()
        self.state_changed = False
        self.refresh_required = False
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
        self.ui.deleteIslandButton.clicked.connect(self.process_delete_vm_request)

    def exec(self):
        self.window.exec()

    def load_settings(self):
        self.ui.vmnameLineEdit.setText(self.config['vmname'])
        self.ui.vboxmanagePathLineEdit.setText(get_full_path(self.config['vboxmanage']))
        self.ui.dfLineEdit.setText(get_full_path(self.config['data_folder']))

    def restore_default_vmname(self):
        self.config.restore_default("vmname")
        self.ui.vmnameLineEdit.setText(self.config["vmname"])
        self.ui.vmnameSave.setEnabled(False)
        self.refresh_required = True

    def restore_default_vboxmanage_path(self):
        self.config.restore_default("vboxmanage")
        self.ui.vboxmanagePathLineEdit.setText(get_full_path(self.config["vboxmanage"]))
        self.ui.vboxmanageSave.setEnabled(False)
        self.refresh_required = True

    def restore_default_data_folder_path(self):
        #Check if custom path is different from default
        #confirm
        if self.config.is_default("data_folder"):
            print("Already default")
            return

        res = QM.question(QM(self.window),
                          "Confirm",
                          "This will require stopping Islands. Continue?",
                          QM.Yes | QM.No)
        if res == QM.No:
            return
        print("Restoring default data folder")
        self.island_manager.restore_default_df_path()
        self.ui.dfLineEdit.setText(get_full_path(self.config['data_folder']))

    def process_delete_vm_request(self):
        res = QM.warning(QM(self.window),
                         "Delete Island",
                         "This is going to unregister Island virtual machine, "
                              "wipe its files and reset VM settings to default. " 
                              "Data files will be saved. Continue?",
                         QM.Yes | QM.No)
        if res == QM.Yes:
            try:
                if self.island_manager.is_running():
                    self.island_manager.stop_island_sync(force=True)
                    time.sleep(3)
                self.setup.delete_islands_vm()
                self.setup.reset_vm_config()
                show_notification(self.window, "Island virtual machine has been deleted")

            except Exception as e:
                errmsg = "Island deletion error: %s " % str(e)
                log.error(errmsg)
                log.exception(e)
                show_user_error_window(self.window, errmsg)



    def save_datafolder_path(self):
        res = QM.question(QM(self.window),
                          "Confirm",
                          "This will require stopping Islands. Continue?",
                          QM.Yes | QM.No)
        if res == QM.No:
            return
        print("saving new data folder")
        self.island_manager.set_new_datafolder(self.ui.dfLineEdit.text())
        self.ui.dfLineEdit.setText(get_full_path(self.config['data_folder']))


    def save_vboxmanage_path(self):
        try:
            self.setup.set_vboxmanage_path(self.ui.vboxmanagePathLineEdit.text())

        except Exception as e:
            show_notification(self.window, "Error setting vboxmanage path: %s" % str(e))



    def save_vmname(self):
        val = self.ui.vmnameLineEdit.text().strip()
        ptrn = re.compile('[A-z]+')
        if not ptrn.match(val):
            show_notification("Invalid name for virtual machine")
            return
        self.config['vmname'] = val
        self.config.save()
        self.ui.vmnameSave.setEnabled(False)





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
        res = f_dialog.getExistingDirectory(self.window, "Select directory", directory=get_full_path(self.config["homedir"]))
        if res:
            self.ui.dfLineEdit.setText(get_full_path(res))


