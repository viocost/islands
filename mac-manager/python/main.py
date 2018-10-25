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

from PyQt5.QtWidgets import QApplication, QWidget, QMainWindow

from window import Ui_MainWindow


def app():
    app = QApplication(sys.argv)
    mw = QMainWindow()
    ui = Ui_MainWindow()
    ui.setupUi(mw)
    mw.show()
    sys.exit(app.exec_())


if __name__ == "__main__":
    app()



