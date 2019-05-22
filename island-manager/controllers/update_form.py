from PyQt5.QtWidgets import QDialog, QFileDialog, QMessageBox as QM
from PyQt5.QtCore import QObject, pyqtSignal, Qt
from PyQt5.QtGui import QTextCursor
from views.update_form.update_form import Ui_IslandsUpdate
from lib.util import get_full_path, sizeof_fmt, show_user_error_window, show_notification
import time

import logging


log = logging.getLogger(__name__)



class UpdateForm(QObject):

    output = pyqtSignal(str)
    progress = pyqtSignal(str, str, str, str, bool)
    download_timeout = pyqtSignal()
    install_error = pyqtSignal(int, str)
    update_completed = pyqtSignal(bool, str)
    update_ui = pyqtSignal()
    unknown_key_confirm_request = pyqtSignal()

    def __init__(self, parent, config, islands_manager, setup):
        QObject.__init__(self)
        log.debug("Initializing update form")
        self.parent = parent
        self.config = config
        self.setup = setup
        self.islands_manager = islands_manager
        self.ui = Ui_IslandsUpdate()
        self.window = QDialog(parent)
        self.update_ui.connect(self.update_els_visibility)
        self.ui.setupUi(self.window)
        self.ui.opt_download.clicked.connect(self.update_els_visibility)
        self.ui.opt_from_file.clicked.connect(self.update_els_visibility)
        self.ui.btn_cancel.clicked.connect(self.close)
        self.ui.btn_update.clicked.connect(self.run_update)
        self.ui.magnet_link.textChanged.connect(self.update_els_visibility)
        self.ui.path_to_image.textChanged.connect(self.update_els_visibility)
        self.ui.btn_select_image_file.clicked.connect(self.select_image)
        self.ui.group_options.setId(self.ui.opt_download, 0)
        self.ui.group_options.setId(self.ui.opt_from_file, 1)
        self.ui.group_options.buttonClicked[int].connect(self.ui.stack_inputs.setCurrentIndex)
        self.output.connect(self.appender)
        self.progress.connect(self.progress_bar_handler)
        self.update_completed.connect(self.process_update_result)

    def exec(self):
        self.window.exec()

    def update_els_visibility(self):
        from_file_checked = self.ui.opt_from_file.isChecked()
        download_checked = self.ui.opt_download.isChecked()

        update_enabled = (from_file_checked and len(self.ui.path_to_image.text()) > 0) or \
                         (download_checked and len(self.ui.magnet_link.text()) > 0)
        self.ui.btn_update.setEnabled(update_enabled)
        self.ui.btn_update.setStyleSheet('color: "green"') if update_enabled else \
            self.ui.btn_update.setStyleSheet('color: #777')

    def process_update_result(self, is_success, msg=""):
        if is_success:
            QM.information(QM(self.window), "Update successful", "Update completed successfully!", QM.Ok)
            self.close()
        else:
            self.lock_form(False)
            show_user_error_window(self.window, "UPDATE ERROR: %s " % msg)
            self.update_els_visibility()

    def init_progress_bar(self, title, size=None):
        ratio = "0/%d" % size if size is not None else ""
        self.progress_bar_handler(action='init',
                                  title=title,
                                  progress_in_percents="0",
                                  ratio=ratio,
                                  success=True)



    def update_progress_bar(self, progress, downloaded, total_size=None, title=None):
        ratio = "%s/%s" % (str(sizeof_fmt(downloaded)), str(
            sizeof_fmt(total_size))) if downloaded is not None and total_size \
            else ""
        title = title if title is not None else ""
        self.progress_bar_handler(action='update',
                                  title=title,
                                  progress_in_percents=str(progress),
                                  ratio=ratio,
                                  success=True)

    def finalize_progress_bar(self, progress=None, downloaded=None, total_size=None, title=None):
        ratio = "%s/%s" % (str(downloaded), str(total_size)) if downloaded is not None and total_size \
            else ""
        self.progress_bar_handler(
                                  action='finalize',
                                  title=title,
                                  progress_in_percents=str(progress),
                                  ratio=ratio,
                                  success=True)

    def on_download_timeout(self):
        msg = "Download is stalled. It may be due to poor network connection " \
              "or torrent seeds are not reachable.\nWould you like abort download?"
        res = QM.question(QM(self.window), "Download timeout", msg, QM.Yes | QM.No)
        if res == QM.Yes:
            self.setup.vm_installer.abort_download()
            self.download_timeout.disconnect()
        else:
            self.setup.vm_installer.resume_download()

    def on_complete(self, msg,  size=18, color='green', ):
        self.output.emit('<p style="color: {color}; font-size: {size}px"> {msg} </p>'
                         .format(msg=msg, size=size, color=color))
        self.update_ui.emit()

    def on_error(self, msg, size=12, color='red'):
        log.debug("GOT MESSAGE: %s" % msg)
        self.output.emit('<p style="color: {color}; font-size: {size}px"> {msg} </p>'
                         .format(msg=msg, size=size, color=color))
        self.update_ui.emit()

    def run_update(self):
        """
        Launches VM installation
        """
        log.debug("Running update")
        self.on_message("Initializing islands update")
        self.ui.output_console.setVisible(True)
        if not (self.ui.opt_from_file.isChecked() or self.ui.opt_download.isChecked()):
            msg = "None of VM update option are selected"
            log.debug(msg)
            show_user_error_window(self.window, msg)
            return
        if self.islands_manager.is_running():
            self.on_message("Islands currently running. Shutting down...")
            self.islands_manager.stop_island_sync(force=True)
            self.on_message("Islands was shut down. Now updating...")
        data_path = get_full_path(self.config["data_folder"])
        self.lock_form()
        log.info("Attempting to update islands VM...")
        self.unknown_key_confirm_request.connect(self.untrusted_key_confirm)
        self.lock_form(True)
        if self.ui.opt_download.isChecked():
            self.download_timeout.connect(self.on_download_timeout)
        log.debug("Trying to import VM from %s " % self.ui.path_to_image.text())
        self.setup.run_update(on_message=self.on_message,
                              on_complete=lambda res, opt_msg="":
                              self.update_completed.emit(res, opt_msg),
                              on_error=self.on_error,
                              init_progres_bar=self.get_init_progress_bar_handler(),
                              update_progres_bar=self.get_update_progress_bar_handler(),
                              finalize_progres_bar=self.get_finalize_progress_bar_handler(),
                              download=self.ui.opt_download.isChecked(),
                              setup=self.setup,
                              on_download_timeout=lambda: self.download_timeout.emit(),
                              magnet_link=self.ui.magnet_link.text(),
                              on_confirm_required=lambda: self.unknown_key_confirm_request.emit(),
                              image_path=self.ui.path_to_image.text(),
                              config=self.config,
                              data_path=data_path)

    def lock_form(self, lock=True):
        enbale_elements = not lock
        self.ui.opt_download.setEnabled(enbale_elements)
        self.ui.opt_from_file.setEnabled(enbale_elements)
        self.ui.btn_select_image_file.setEnabled(enbale_elements)
        self.ui.path_to_image.setEnabled(enbale_elements)
        self.ui.magnet_link.setEnabled(enbale_elements)
        self.ui.btn_update.setEnabled(enbale_elements)
        self.ui.btn_cancel.setEnabled(enbale_elements)

    def close(self):
        log.debug("Closing update form")
        self.window.close()
        self.window.destroy()

    def set_installing(self):
        self.ui.output_console.setVisible(True)
        self.ui.opt_download.setEnabled(False)
        self.ui.opt_from_file.setEnabled(False)
        self.ui.magnet_link.setEnabled(False)
        self.ui.path_to_image.setEnabled(False)
        self.ui.btn_select_image_file.setEnabled(False)
        self.ui.btn_cancel.setEnabled(False)
        self.ui.btn_update.setEnabled(False)

    def select_image(self):
        res = QFileDialog.getOpenFileName(QFileDialog(self.window),
                                          "Select Islands image file",
                                          get_full_path(self.config['homedir']),
                                          "Islands image file (*.isld)")
        if res == ('', ''):
            print("Cancelled")
        else:
            self.ui.path_to_image.setText(res[0])

    def reset_console(self):
        self.ui.output_console.setText("")

    def appender(self, msg):
        self.ui.output_console.append(msg)
        sb = self.ui.output_console.verticalScrollBar()
        sb.setValue(sb.maximum())

    # Console event handlers
    # This handlers are used by setup installer to display the output and update status of
    # installation process

    def on_message(self, msg, size=12, color='blue'):
        log.debug("GOT MESSAGE: %s" % msg)
        self.output.emit('<p style="color: {color}; font-size: {size}px"> {msg} </p>'
                         .format(msg=msg, size=size, color=color))

    # Baking progress bar handlers
    def get_init_progress_bar_handler(self):
        def init_progress_bar(title, size=None):
            ratio = "0/%d" % size if size is not None else ""
            self.progress.emit('init', title, "0", ratio, True)
        return init_progress_bar

    def get_update_progress_bar_handler(self):
        def update_progress_bar(progress, downloaded, total_size=None, title=None):
            ratio = "%s/%s" % (str(sizeof_fmt(downloaded)), str(
                sizeof_fmt(total_size))) if downloaded is not None and total_size \
                else ""
            title = title if title is not None else ""
            self.progress.emit('update', title, str(progress), ratio, True)

        return update_progress_bar

    def get_finalize_progress_bar_handler(self):
        def finalize_progress_bar(progress=None,  downloaded=None, total_size=None, title=None):
            ratio = "%s/%s" % (str(downloaded), str(total_size)) if downloaded is not None and total_size \
                else ""
            self.progress.emit('finalize', title, str(progress), ratio, True)
        return finalize_progress_bar

    def progress_bar_handler(self, action, title="", progress_in_percents="", ratio="", success=True):

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

        def construct_progress_bar():
            multiple = .3
            fill = '='
            void = ' '
            fills = int(multiple*int(float(progress_in_percents)))
            whitespaces = int(multiple*100) - fills
            return '<span style="font-family: Courier"><b> {:>3}% </b><span style="white-space: pre;">|{}>{}|</span> </span>{}'.format(progress_in_percents, fill*fills,
                                        void * whitespaces, ratio)

        def init_progress_bar():
            self.ui.output_console.append('<br><b>{title}</b>'.format(title=title))
            self.ui.output_console.append(construct_progress_bar())

        def update_progress_bar():
            b = construct_progress_bar()
            cursor = self.ui.output_console.textCursor()

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
            self.ui.output_console.append(final_word)

        if action == "update":
            update_progress_bar()
        elif action == 'init':
            init_progress_bar()
        elif action == 'finalize':
            finalize_progress_bar()


    def untrusted_key_confirm(self):
        msg = "Warning, the public key of the image you are trying to use is not registered as trusted.\n" + \
            "Would you like to import image anyway? The public key will be registered as trusted."
        res = QM.question(QM(self.window), "Unknown public key", msg, QM.Yes | QM.No)
        if res == QM.Yes:
            self.setup.vm_installer.unknown_key_confirm_resume_update()
        else:
            self.process_update_result(False, "Error: untrusted key!")
