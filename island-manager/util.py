import os
import platform
from exceptions import CmdExecutionError

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


platform.system()

def check_output(func):
    def wrapper(*args, **kwargs):
        res = func(*args, **kwargs)
        if res[0] != 0:
            raise CmdExecutionError(*res)
        return res
    return wrapper
