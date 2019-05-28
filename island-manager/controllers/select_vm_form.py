from views.select_vm_form.select_vm_form import Ui_SelectVM
from PyQt5.QtWidgets import QDialog


class SelectVMForm:
    def __init__(self, parent, setup):
        self.ui = Ui_SelectVM()
        self.window = QDialog(parent)
        self.ui.setupUi(self.window)
        self.setup = setup
        self.prepare_vm_list()

    def exec(self):
        return self.window.exec()

    def prepare_vm_list(self):
        self.ui.vms_list.clear()
        vms = self.setup.get_vm_list()
        for vm in vms:
            if len(vm[0]) > 1:
                self.ui.vms_list.addItem(vm[0])
