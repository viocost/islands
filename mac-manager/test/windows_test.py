import unittest
import util
from im_config import IMConfig
from commander import Commander as Cmd
import json

class TestConfig(unittest.TestCase):


    def test_init(self):

        c = IMConfig("darwin", "../", "../", "../os_defaults/")
        cmd = Cmd(c, "darwin")
        print(cmd.start_vm())

