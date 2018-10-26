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
from island_manager import IslandManager
from window import Ui_MainWindow


def app():
    app = QApplication(sys.argv)
    im = IslandManager()
    mw = QMainWindow()
    ui = Ui_MainWindow()
    ui.setupUi(mw)
    assign_handlers(ui, im)
    mw.show()
    refresh_island_status(ui, im)
    sys.exit(app.exec_())


def assign_handlers(ui, island_manager):
    ui.launchIslandButton.clicked.connect(get_main_control_handler("launch", ui, island_manager))
    ui.shutdownIslandButton.clicked.connect(get_main_control_handler("stop", ui, island_manager))
    ui.restartIslandButton.clicked.connect(get_main_control_handler("restart", ui, island_manager))


def get_main_control_handler(cmd, ui, island_manager):
    cmds = {
        "launch": "launch_island",
        "stop": "stop_island",
        "restart": "restart_island",
    }
    if cmd not in cmds:
        raise KeyError

    def handler():
        print("Command: %s" % cmd)
        res = eval("island_manager.%s()" % (cmds[cmd]))
        print(res)
        refresh_island_status(ui, island_manager)
    return handler


def refresh_island_status(ui, island_manager):
    try:
        if island_manager.is_running():
            ui.islandStatus.setText("Running")
            ui.islandStatus.setStyleSheet('color: green')
        else:
            ui.islandStatus.setText("Not running")
            ui.islandStatus.setStyleSheet('color: red')
    except Exception:
        ui.islandStatus.setText("Unknown")
        ui.islandStatus.setStyleSheet('color: gray')


if __name__ == "__main__":
    app()



