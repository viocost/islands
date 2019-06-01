from views.image_authoring_form.image_authoring_form import Ui_ImageAuthoringForm
from PyQt5.QtWidgets import QDialog, QFileDialog, QMessageBox
from PyQt5.QtCore import pyqtSignal, QObject
from lib.util import get_full_path, show_user_error_window
from lib.image_authoring import ImageAuthoring
from threading import Thread
from time import sleep
from random import random
import os
import shutil
import logging




log = logging.getLogger(__name__)

class ImageAuthoringForm(QObject):

    progress = pyqtSignal(str, int)
    error = pyqtSignal(str)
    success = pyqtSignal()
    def __init__(self, parent, config, key_manager, torrent_manager):
        QObject.__init__(self, parent)
        self.key_manager = key_manager
        self.torrent_manager = torrent_manager
        self.config = config
        self.window = QDialog(parent=parent)
        self.ui = Ui_ImageAuthoringForm()
        self.ui.setupUi(self.window)
        self.assign_handlers()

    def assign_handlers(self):
        self.ui.btn_cancel.clicked.connect(self.cancel)
        self.ui.btn_go.clicked.connect(self.start_authoring)
        self.ui.btn_select_source.clicked.connect(self.select_source_file)
        self.ui.btn_select_dest_path.clicked.connect(self.select_dest_folder)
        self.progress.connect(self.on_progress)
        self.error.connect(self.on_error)
        self.success.connect(self.on_success)

    def fill_keys(self):
        user_keys = self.key_manager.get_user_private_keys_info()
        self.ui.select_private_key.addItems(
            " || ".join(filter(None, [user_keys[key]["alias"], user_keys[key]["pkfp"]])) for key in user_keys.keys()
        )

    def on_progress(self, msg, progress):
        log.debug("Received progress signal")
        self.ui.lbl_action.setStyleSheet('color: "black"')
        self.ui.lbl_action.setText(msg)
        self.ui.progressBar.setValue(progress)

    def on_error(self, msg):
        self.ui.lbl_action.setText("ERROR! Authoring process has not been finished")
        self.ui.lbl_action.setStyleSheet('color: "red"')
        show_user_error_window(self.window, msg)

    def on_success(self):
        QMessageBox.information(QMessageBox(self.window), "Success", "Image authoring successfully completed!", QMessageBox.Ok)
        log.debug("Closing authoring form")
        self.window.close()
        self.window.destroy()


    def exec(self):
        self.fill_keys()
        self.window.exec()

    def select_source_file(self):
        log.debug("Selecting source image")
        res = QFileDialog.getOpenFileName(QFileDialog(self.window),
                                          "Select Islands image file",
                                          get_full_path(self.config['homedir']),
                                          "Virtual Appliance (*.ova)")
        if res == ("", ""):
            log.debug("Image select cancel")
        else:
            self.ui.source_file.setText(res[0])
            log.debug("Source path is %s" % (res[0]))

    def select_dest_folder(self):
        log.debug("Selecting dest dir")
        f_dialog = QFileDialog()
        f_dialog.setFileMode(QFileDialog.Directory)
        res = f_dialog.getExistingDirectory(self.window)
        if res:
            log.debug("Dest directory chosen: %s" % res)
            self.ui.path_to_dest.setText(res)
        else:
            log.debug("Directory selection cancelled")



    def cancel(self):
        self.window.close()
        self.window.destroy()

    def start_authoring(self):
        log.debug("Starting authoring process...")
        if self.form_errors_found():
            log.debug("Form errors found. Aborting authoring")
            return
        self.ui.lbl_action.setText("Starting authoring process...")
        self.ui.progressBar.setValue(0)
        self.ui.progress_wrap.setVisible(True)
        log.debug("Starting thread")
        thread = Thread(target=self.process)
        thread.start()

    def process(self):
        log.debug("Thread started")
        sleep(1)
        temp_dir = None
        try:
            log.debug("Verifying user input")
            self.progress.emit("Verifying input...", 0)
            log.debug("Processing image authoring...")

            self.progress.emit("Verifying input...", 3)
            sleep(random())
            self.progress.emit("Initializing authoring master...", 3)
            image_authoring = ImageAuthoring(self.config, self.key_manager)
            image_version = self.ui.image_version.text()
            islands_version = self.ui.islands_version.text()
            path_to_image = self.ui.source_file.text()
            output_path = self.ui.path_to_dest.text()
            output_filename = self.ui.out_filename.text()
            publisher = self.ui.publisher.text()
            note = self.ui.note.toPlainText()
            private_pkfp = self.ui.select_private_key.currentText().split("||")[-1].strip(" ")
            log.debug(private_pkfp)
            key_password = self.ui.private_key_password.text(),
            key_password = key_password[0]
            log.debug(key_password)
            key_data = self.key_manager.get_private_key_data(private_pkfp)
            log.debug("Verifying data")
            image_authoring.verify_input(key_data, output_path, path_to_image)
            self.progress.emit("Verifying data...", 10)
            sleep(random())
            log.debug("creating temp folder")
            self.progress.emit("Preparing space...", 15)
            temp_dir = image_authoring.make_temp_dir(output_path)
            sleep(random())
            log.debug("Signing image")
            self.progress.emit("Signing image...", 17)
            ic = image_authoring.sign_source(key_data, key_password, path_to_image)
            log.debug("Creating info")
            self.progress.emit("Creating info...", 38)
            image_authoring.create_info(ic, image_version, islands_version, note, publisher, temp_dir)
            self.progress.emit("Signing info info...", 48)
            image_authoring.sign_info(ic, temp_dir)
            self.progress.emit("Writing image..", 60)
            image_authoring.write_image(path_to_image, temp_dir)
            self.progress.emit("Packing...", 85)
            path_to_res = image_authoring.zip_up(output_filename, output_path, temp_dir)
            self.progress.emit("Cleaning up..", 95)
            image_authoring.cleanup(temp_dir)
            if self.ui.chk_seed_now.isChecked():
                self.torrent_manager.create_torrent(path_to_res, True)
            self.progress.emit("Done!", 100)
            self.success.emit()
        except Exception as e:
            log.error("Image authoring error: %s" % str(e))
            log.exception(e)
            self.error.emit(str(e))
        finally:
            if temp_dir and os.path.isdir(temp_dir):
                shutil.rmtree(temp_dir)

    def start_seeding(self):
        pass

    def form_errors_found(self):
        log.debug("Verifying user input")
        log.debug("Checking image file")

        if not os.path.exists(self.ui.source_file.text()):
            show_user_error_window(self.window, "Source file not found...")
            return True
        if not os.path.isdir(self.ui.path_to_dest.text()):
            show_user_error_window(self.window, "Destination directory does not exist")
            return True
        required_fields = []

        if self.ui.private_key_password.text().strip(" ") == "":
            required_fields.append("Private key password")
        if self.ui.private_key_password.text().strip(" ") == "":
            required_fields.append("Island version")
        if self.ui.private_key_password.text().strip(" ") == "":
            required_fields.append("Image version")

        if len(required_fields) > 0 :
            show_user_error_window(self.window, "Please fill the required fields: %s" % " ".join(required_fields))
            return True

        if self.ui.select_private_key.count() == 0:
            show_user_error_window(self.window, "You have not created your key yet. Create a key and try again")
            return True
        return False