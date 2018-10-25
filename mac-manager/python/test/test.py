import unittest
from im_config import IMConfig

class TestConfig(unittest.TestCase):
    def test_init(self):
        c = IMConfig()
        c["vmid"] = "12345"
        c.save()

    def test_custom(self):
        c = IMConfig()
        assert c["vmid"] == "12345"

