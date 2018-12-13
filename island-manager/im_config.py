import os
import json


DEFAULT_CONFIG="default_config.json"
OS_SPECIFIC_DEFAULTS={
    "darwin": "mac.json",
    "win32": "windows.json",
    "linux": "linux.json"
}

CUSTOM_CONFIG = "config.json"


class IMConfig:
    def __init__(self, platform, default_config_path="", config_path="", os_defaults_path="os_defaults/"):
        self.__default = self.__get_default("".join((default_config_path, DEFAULT_CONFIG)))
        self.load_os_specific_defaults(platform, os_defaults_path)
        self.__custom = self.__load("".join((config_path, CUSTOM_CONFIG)))

    def save(self):
        with open("config.json", "w") as f:
            json.dump(self.__custom, f)

    def __getitem__(self, item):
        result = self.__custom.get(item) or self.__default.get(item)
        if result is not None:
            return result
        raise KeyError

    def __setitem__(self, key, value):
        if key in self.__default:
            self.__custom[key] = value
        else:
            raise KeyError

    def __contains__(self, item):
        return item in self.__custom or item in self.__default


    def __load(self, config_path):
        if os.path.exists(config_path):
            with open(config_path) as f:
                return json.load(f)
        else:
            return dict()

    def restore_default(self, key=None):
        if key:
            if key not in self.__default:
                raise KeyError("Non-existent config property %s" % key)
            if key in self.__custom:
                del self.__custom[key]
        else:
            self.__custom = {}
        self.save()

    def __get_default(self, config_path):
        if os.path.exists(config_path):
            with open(config_path) as f:
                return json.load(f)
        else:
            raise MissingDefaultConfig

    def load_os_specific_defaults(self, platform, os_defaults_path):
        if platform not in OS_SPECIFIC_DEFAULTS:
            raise KeyError("Invalid OS name or unupported OS")
        with open("".join((os_defaults_path, OS_SPECIFIC_DEFAULTS[platform])), "r") as f:
            self.__default.update(json.load(f))

    def is_default(self, key):
        if key not in self.__default:
            raise KeyError("Non-existent config property %s" % key)
        return key not in self.__custom



class MissingDefaultConfig(Exception):
    pass
