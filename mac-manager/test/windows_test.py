import unittest
import util
from im_config import IMConfig
from commander import Commander as Cmd
import json

class TestConfig(unittest.TestCase):


    def test_commander(self):
        c = IMConfig("win32", "../", "../", "../os_defaults/")
        cmd = Cmd(c, "win32  ")
        assert(cmd.start_vm() == "%PROGRAMFILES%\\Oracle\VirtualBox\\vboxmanage.exe startvm Island --type headless")

