#! /usr/bin/env python
# -*- coding: utf-8 -*-
# vim:fenc=utf-8
#
# Copyright © 2018 kostia <kostia@i.planet-a.ru>
#
# Distributed under terms of the MIT license.

"""

"""

import sys
import forms.resources_rc
from PyQt5.QtWidgets import QApplication, QMessageBox as qm
from PyQt5.QtGui import QPixmap, QIcon
from island_manager import IslandManager
from island_setup import IslandSetup
from forms.main_window import MainWindow
from im_config import IMConfig
from commander import Commander



class Application:
    def __init__(self):
        self.config = IMConfig(sys.platform)
        self.commander = Commander(self.config, sys.platform)
        self.app = self.prepare_app()
        self.island_manager = IslandManager(self.config, self.commander)
        self.setup = IslandSetup(self.config, self.commander)
        self.main_window = MainWindow(self.config, self.island_manager, self.setup)


    def run(self):
        self.main_window.show()
        sys.exit(self.app.exec_())

    # Prepares application instance and returns it
    def prepare_app(self):
        app = QApplication(sys.argv)
        appicon = QIcon()
        appicon.addPixmap(QPixmap(":/images/island"))
        app.setWindowIcon(appicon)
        return app

    def kill(self):
        print("Exiting!")
        self.app.quit()

if __name__ == "__main__":
    raise Exception("This module is not supposed to run as main")



