import unittest
import util
from im_config import IMConfig
#from commander import Commander as Cmd
import json
from downloader import Downloader as dl
from os import path

class TestConfig(unittest.TestCase):


    def test_commander(self):
        c = IMConfig("win32", "../", "../", "../os_defaults/")
        cmd = Cmd(c, "win32  ")
        assert(cmd.start_vm() == "%PROGRAMFILES%\\Oracle\VirtualBox\\vboxmanage.exe startvm Island --type headless")


    def test_download(self):
        r = dl.get("https://sourceforge.net/projects/islands-image/files/Islands_vm_v0.0.011.ova/download", path.expandvars("%USERPROFILE%\\Downloads\\"))
        print(r)

    def test_config(self):
        c = IMConfig("win32", "../", "../", "../os_defaults/")
        if "downloads_path" in c:
            print("Yeah")