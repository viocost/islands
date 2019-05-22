from PyQt5.QtCore import QObject


class UpdateProgressWindow(QObject):
    def __init__(self, islands_manager):
        QObject.__init__(self)
        self.islands_manager = islands_manager

