import re
import hashlib
from lib.vboxinstaller import VBoxInstaller
from lib.vm_installer import VMInstaller
from lib.exceptions import *
from lib.executor import ShellExecutor as Executor
from lib.util import check_output, get_stack
import logging

log = logging.getLogger(__name__)


from os import environ


class IslandSetup:

    def __init__(self, config, commander, file_manager, torrent_manager):
        self.vm_installer = None
        self.vbox_installer = None
        self.file_manager = file_manager
        self.cmd = commander
        self.torrent_manager = torrent_manager
        self.__config = config

    def abort_vm_install(self):
        log.debug("Install setup: aborting install")
        if self.vm_installer:
            self.vm_installer.abort_install()

    # Initializes vm installer in separate thread and starts it
    def run_vm_installer(self, *args, **kwargs):
        kwargs["file_manager"] = self.file_manager
        kwargs["torrent_manager"] = self.torrent_manager
        self.vm_installer = VMInstaller(*args, **kwargs)
        self.vm_installer.start()

    def run_update(self, *args, **kwargs):
        kwargs["file_manager"] = self.file_manager
        kwargs["torrent_manager"] = self.torrent_manager
        self.vm_installer = VMInstaller(*args, **kwargs)
        self.vm_installer.prepare_update()

    def resume_vm_install(self, *args, **kwargs):
        self.vm_installer.unknown_key_confirm_resume()

    def run_vbox_installer(self, *args, **kwargs):
        self.vbox_installer = VBoxInstaller(*args, **kwargs)
        self.vbox_installer.start()

    def resume_vbox_setup_root_password(self, password):
        self.vbox_installer.root_password_received_resume(password)



    def get_islands_ip(self):
        res = Executor.exec_sync(self.cmd.ip_a_eth1_onguest())
        response = [line for line in res[1].split('\n') if "eth1" in line]
        for line in response:
            search_res = re.search(r'(\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b)', line)
            if search_res:
                log.debug("Found IP address %s " % search_res.group())
                return search_res.group()


    def sha1(self, fname):
        hash_sha1 = hashlib.sha1()
        with open(fname, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_sha1.update(chunk)
        return hash_sha1.hexdigest()

    # Parses shared folder path
    # Accepts either absolute path or relative to home directory
    # If relative path (started with dots) will be passed  - InvalidPathFormat exception will be risen
    def parse_shared_folder_path(self, data_folder_path):
        data_folder_path = data_folder_path.strip()
        path_elements = data_folder_path.split("/")
        path_elements.append("islandsData")
        if data_folder_path[0] == "~":
            path_elements[0] = environ["HOME"]
        elif data_folder_path[0] == ".":
            raise InvalidPathFormat("Path to shared folder must be absolute")
        return "/".join(path_elements)
    # END

    def is_setup_required(self):
        log.debug("Checking if setup is required")
        if not self.is_vbox_set_up():
            log.debug("Virtualbox is not found")
            return "Virtualbox not installed or not found"
        if not self.is_islands_vm_exist():
            log.debug("Islands VM does not exist")
            return "Island virtual machine not installed or not found"
        log.debug("Setup is not required")
        return False

    # SETTINGS SECTION
    def set_islands_vm_name(self, name):
        pass

    def set_islands_vm_id(self, id):
        pass

    def get_vmware_docs(self):
        pass

    def is_vbox_set_up(self):
        return self.is_vbox_installed() and self.is_vbox_up_to_date()

    def is_vbox_installed(self):
        com = self.cmd.vboxmanage_version()
        res = Executor.exec_sync(com)
        log.debug("is_vbox_installed 0: %s 1: %s 2:%s " % (str(res[0]), str(res[1]), str(res[2])))
        return res[0] == 0

    def is_vbox_up_to_date(self):
        log.debug("Checking vbox version.")
        res = Executor.exec_sync(self.cmd.vboxmanage_version())
        v_output = list(filter(None, res[1].split("\n")))

        version = re.sub(r'[^\d^\.]', "", v_output[-1])
        version = [int(i) for i in version.split('.')]
        version[2] = int(str(version[2])[0:2])
        return (res[0] == 0 and version[0] == 5
                and version[1] >= 2 and version[2] >= 18) or version[0] >= 6

    def is_islands_vm_exist(self):
        try:
            execres = Executor.exec_sync(self.cmd.listvms())
            if execres[0] != 0:
                return False
            lines =  execres[1].split("\n")
            pattern = re.compile("^\"%s\".*" % self.__config['vmname'])
            for line in lines:
                if pattern.match(line):
                    return True
            return False
        except Exception as e:
            print("is_islands_vm_exist EXCEPTION!: " + str(e))
            return False

    @check_output
    def delete_islands_vm(self):
        return Executor.exec_sync(self.cmd.delete_vm())

    def reset_vm_config(self):
        self.__config.restore_default("vmname")
        self.__config.restore_default("local_access")
        self.__config.restore_default("local_access_admin")
        self.__config.restore_default("hostonly_adapter")
        self.__config.restore_default("vm_password")
        self.__config.restore_default("vm_username")
        self.__config.save()
