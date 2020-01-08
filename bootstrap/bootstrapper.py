import qbittorrentapi

class Status(Enum):
    IDLE = 0
    INIT = 1
    ERROR = 99


class Bootstrapper:
    def __init__(self):
        self.status = Status.IDLE
        self.error = None
        self.qbt = qbittorrentapi.Client(host='localhost:8080', username='admin', password='adminadmin')
        try:

            self.qbt.auth_log_in()
        except qbittorrentapi.LoginFailed as e:
            self.set_error(str(e))


    def get_status(self):
        return self.status

    def bootstrap(self, magnet):

        self.set_error(Status.INIT)


    def set_status(self, status):
        self.status = status

    def set_error(self, msg):
        self.error = msg
        self.status = Status.ERROR
