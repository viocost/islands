from lib.im_config import IMConfig
from lib.util import get_full_path
import os
import json
import logging

log = logging.getLogger(__name__)


RELEASES_HISTORY_DIR_NAME = "releases_history"

class ImageVersionManager:
    """
    This class automates version management.
    A user can have a number of key pairs, and each key pair can sign any number of Islands releases.

    Version format consists of Alias, version number, release number and modification number.
    The offered output filename will be in format islands_<alias>_<version_number>.<release_number>.<modification_number>
    Example: islands_November_1_02_134.isld

    Each record is signed with  user's key

    Version data is kept in json format. Aliases must be unique per user key.
    Altogether stored release data includes:

    alias, version number, release number, modification number, OVA file hash, signature, date

    """
    def __init__(self, config: IMConfig):
        self.config = config
        self.releases_history_dir = os.path.join(get_full_path(self.config["manager_data_folder"]), RELEASES_HISTORY_DIR_NAME)
        if not os.path.isdir(self.releases_history_dir):
            log.debug("Releases directory does not exist. Creating: %s" % self.releases_history_dir)
            os.makedirs(self.releases_history_dir)


    def get_version_history(self, pkfp: str, branch: str):
        """
        Given public key fingerprint searches for version history and if found returns it
        if not found - none is returned
        :param pkfp: public key fingerprint
        :param branch: branch name
        :return: list with history or None
        """
        pass

    def create_new_branch(self, pkfp: str, branch: str):
        """
        Given public key fingerprint
        :param pkfp: public key fingerprint
        :param branch: branch name
        :return:
        """
        key_history_dir = os.path.join(self.releases_history_dir, pkfp)
        if not os.path.exists(key_history_dir):
            os.mkdir(key_history_dir)

        branch_path = os.path.join(key_history_dir, branch)
        if os.path.exists(branch_path):
            raise VersionBranchAlreadyExist
        with open(branch_path, "w") as fp:
            json.dump(list(), fp)

    def is_branch_exist(self, pkfp: str, branch: str):
        key_history_dir = os.path.join(self.releases_history_dir, pkfp)
        branch_path = os.path.join(key_history_dir, branch)
        return all([os.path.isdir(key_history_dir), os.path.isdir(branch_path)])

    def get_branches(self, pkfp: str):
        key_history_dir = os.path.join(self.releases_history_dir, pkfp)
        if not os.path.isdir(key_history_dir):
            return
        return [d for d in os.listdir(key_history_dir)]


    def save_release_history(self, pkfp: str, branch: str, data: dict):
        key_history_dir = os.path.join(self.releases_history_dir, pkfp)
        branch_path = os.path.join(key_history_dir, branch)
        if not os.path.exists(key_history_dir):
            log.debug("Error saving release history: no history for pkfp %s found. Creating" % pkfp)
            os.mkdir(key_history_dir)

        if not os.path.exists(branch_path):
            history = []
        else:
            with open(branch_path, "r") as fp:
                history = json.load(fp)
        history.append({k: v for k, v in data.items() if k not in ["pkfp", "public_key"]})
        with open(branch_path, "w") as fp:
            log.debug("Writing updated history")
            json.dump(history, fp)



class VersionBranchAlreadyExist(Exception):
    pass
