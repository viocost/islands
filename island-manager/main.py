#! /usr/bin/env python
# -*- coding: utf-8 -*-
# vim:fenc=utf-8
#
# Copyright © 2018 Kostia <viocost@gmail.com>
#
# Distributed under terms of the MIT license.

from lib.application import Application
from lib.im_config import IMConfig
from logging.handlers import RotatingFileHandler
from lib.util import get_full_path
import sys, os
import fasteners
import logging


def main():
    lock = fasteners.InterProcessLock("lockfile")
    gotten = lock.acquire(blocking=False)
    try:
        if gotten:
            config = IMConfig(sys.platform)
            setup_logger(config)
            application = Application(config)
            application.run()
        else:
            print("Another instance of Island Manager is running. Exiting")
            exit(0)
    except Exception as e:
        pass
    finally:
        if gotten:
            lock.release()




# noinspection PyUnreachableCode
def setup_logger(config):
    logger = logging.getLogger()
    if __debug__:
        print("Setting logging to debug mode")
        logger.setLevel(logging.DEBUG)
        handler = logging.StreamHandler(sys.stdout)
        logger.addHandler(handler)
    else:
        print("Setting logging to production mode")
        logger.setLevel(logging.INFO)

    manager_path = get_full_path(config["manager_data_folder"])
    if not os.path.exists(manager_path):
        os.mkdir(manager_path)
    log_path = os.path.join(manager_path, "islands_manager.log")
    file_handler = RotatingFileHandler(log_path, mode="a", maxBytes=5*1024*1024, backupCount=2, encoding=None, delay=0)
    formatter = logging.Formatter('%(asctime)s %(levelname)s %(name)s %(funcName)s(%(lineno)d) %(message)s ')
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    logger.debug("Logger initialized.")




if __name__ == "__main__":
    main()
