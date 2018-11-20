import os
import json


class IMConfig:
    def __init__(self, default_config_path="default_config.json", config_path="config.json" ):
        self.__default = self.__get_default(default_config_path)
        self.__custom = self.__load(config_path)

    def save(self):
        with open("config.json", "w") as f:
            json.dump(self.__custom, f)

    def __getitem__(self, item):
        result =  self.__custom.get(item) or self.__default.get(item)
        if result is not None:
            return result
        raise KeyError

    def __setitem__(self, key, value):
        if key in self.__default:
            self.__custom[key] = value
        else:
            raise KeyError

    def __load(self, config_path):
        if os.path.exists(config_path):
            with open(config_path) as f:
                return json.load(f)
        else:
            return dict()

    def restore_default(self):
        self.__custom = {}
        self.save()

    def __get_default(self, config_path):
        if os.path.exists(config_path):
            with open(config_path) as f:
                return json.load(f)
        else:
            raise MissingDefaultConfig


class MissingDefaultConfig(Exception):
    pass
