from views.key_create_form.key_create_form import Ui_CreatePrivateKeyForm
from PyQt5.QtWidgets import QDialog, QMessageBox
from lib.key_manager import PASSWORD_LENGTH
import logging

log = logging.getLogger(__name__)

class KeyCreateForm:
    def __init__(self, parent, key_manager):
        self.ui = Ui_CreatePrivateKeyForm()
        self.window = QDialog(parent)
        self.ui.setupUi(self.window)
        self.key_manager = key_manager
        self.ui.btn_create.clicked.connect(self.create_key_check)
        self.ui.btn_cancel.clicked.connect(self.cancel)

    def exec(self):
        self.window.exec()

    def create_key_check(self):
        log.debug("Checking data")
        password = self.ui.password.text()
        confirm = self.ui.confirm_password.text()
        if password != confirm:
            self.show_error("Password and confirmation do not match!")
        elif len(password) < PASSWORD_LENGTH:
            self.show_error("Password length must be at least %d symbols" % PASSWORD_LENGTH)
        else:
            alias = self.ui.alias.text()
            self.create_key(password, alias)
            self.close_window()

    def create_key(self, password, alias=None):
        key = self.key_manager.generate_encrypted_user_key(password)
        self.key_manager.save_user_key(
            pkfp=key["pkfp"],
            public=key["public"],
            private=key["private"],
            alias=alias
        )

    def cancel(self):
        self.close_window()

    def close_window(self):
        self.window.close()
        self.window.destroy()

    def show_error(self, message):
        log.warning("Key creation error: %s " % message)
        msgBox = QMessageBox(self.window)
        msgBox.setIcon(QMessageBox.Warning)
        msgBox.setText("Key creation error")
        msgBox.setInformativeText(message)
        msgBox.setDefaultButton(QMessageBox.Ok)
        msgBox.exec()


