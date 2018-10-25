from im_config import IMConfig


class IslandManager():
    def __init__(self):
        self.__config = IMConfig




    def launch_island(self, cmd):
        raise NotImplementedError


    def stop_island(self, cmd):
        raise NotImplementedError


    def restart_island(self, cmd):
        raise NotImplementedError




    def __exec(self, cmd):
        raise NotImplementedError



