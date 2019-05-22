import os, sys
from lib.exceptions import CmdExecutionError, InvalidPlatformError
from PyQt5.QtWidgets import QMessageBox
import logging
import traceback

log = logging.getLogger(__name__)

if sys.platform == "win32":
    import ctypes


def sizeof_fmt(num, suffix='b'):
    num = int(num)
    for unit in ['','k','m','g','t','p','e','z']:
        if abs(num) < 1024.0:
            return "%3.1f %s%s" % (num, unit, suffix)
        num /= 1024.0
    return "%.1f %s%s" % (num, 'Yi', suffix)


def is_file_exist(path):
    full_path = get_full_path(path)
    return os.path.isfile(full_path)


def get_full_path(path):
    return os.path.expandvars(os.path.expanduser(path))


def get_version():
    with open("version", "r") as vfile:
        return vfile.readline()


def get_current_path():
    print(os.getcwd())

def has_admin_rights_win32():
    if sys.platform != "win32":
        raise InvalidPlatformError("Attempt to check windows admin privileges on non-windows platform")
    return ctypes.windll.shell32.IsUserAnAdmin() != 0


def read_file_in_chunks(file_obj, chunk_size=262144):
    while True:
        data = file_obj.read(chunk_size)
        if not data:
            break
        yield data


def check_output(func):
    def wrapper(*args, **kwargs):
        res = func(*args, **kwargs)
        if res[0] != 0:
            for line in res[1]:
                log.debug("STDOUT: %s " % line)
            for line in res[2]:
                log.debug("STDOUT: %s " % line)
            raise CmdExecutionError(*res)
        return res
    return wrapper


def show_user_error_window(parent, message):
    msgBox = QMessageBox(parent)
    msgBox.setIcon(QMessageBox.Warning)
    msgBox.setText("Error")
    msgBox.setInformativeText(message)
    msgBox.setDefaultButton(QMessageBox.Ok)
    msgBox.exec()


def show_notification(parent, text):
    log.debug("About to show notifiction: %s" % text)
    dialog = QMessageBox(parent)
    QMessageBox.warning(dialog, "Warning", text, buttons=QMessageBox.Ok)

def get_stack():
    return "".join(traceback.format_stack())
