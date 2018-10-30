import unittest
import re
from im_config import IMConfig
from island_manager import IslandManager


class TestConfig(unittest.TestCase):

    def test_init(self):
        print("Test 1")
        c = IMConfig()
        c["vmid"] = "12345"
        c.save()

    def test_custom(self):
        print("Test 2")
        c = IMConfig()
        assert c["vmid"] == "12345"

    def test_im_init(self):
        pattern = re.compile(r"^(?=.*vboxmanage)(?=.*Island).+")
        im = IslandManager()
        a = im.get_command("launch")
        assert re.match(pattern, a)
        print(a)

    def test_stop_cmd(self):
        pattern = re.compile(r"^(?=.*vboxmanage)(?=.*Island).+")
        im = IslandManager()
        a = im.get_command("stop")
        assert re.match(pattern, a)
        print(a)

    def test_start(self):
        im = IslandManager()
        respone = im.launch_island()
        print(respone)

    def test_stop(self):
        im = IslandManager()
        respone = im.stop_island()
        print(respone)

    def test_is_vm_running(self):
        im = IslandManager()
        r = im.is_running()
        print(r)

    def test_is_vm_running(self):
        im = IslandManager()
        r = im.stop_island()
        print(r)
        assert(im.is_running() is False)
        im.launch_island()
        assert (im.is_running() is True)


