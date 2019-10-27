# -*- coding: utf-8 -*-

# Form implementation generated from reading ui file '..\views\key_create_form\key_create_form.ui'
#
# Created by: PyQt5 UI code generator 5.11.3
#
# WARNING! All changes made in this file will be lost!

from PyQt5 import QtCore, QtGui, QtWidgets

class Ui_CreatePrivateKeyForm(object):
    def setupUi(self, CreatePrivateKeyForm):
        CreatePrivateKeyForm.setObjectName("CreatePrivateKeyForm")
        CreatePrivateKeyForm.setWindowModality(QtCore.Qt.WindowModal)
        CreatePrivateKeyForm.resize(428, 311)
        CreatePrivateKeyForm.setModal(True)
        self.verticalLayout_2 = QtWidgets.QVBoxLayout(CreatePrivateKeyForm)
        self.verticalLayout_2.setObjectName("verticalLayout_2")
        self.form_title = QtWidgets.QLabel(CreatePrivateKeyForm)
        font = QtGui.QFont()
        font.setPointSize(14)
        self.form_title.setFont(font)
        self.form_title.setObjectName("form_title")
        self.verticalLayout_2.addWidget(self.form_title)
        spacerItem = QtWidgets.QSpacerItem(20, 40, QtWidgets.QSizePolicy.Minimum, QtWidgets.QSizePolicy.Minimum)
        self.verticalLayout_2.addItem(spacerItem)
        self.verticalLayout = QtWidgets.QVBoxLayout()
        self.verticalLayout.setContentsMargins(-1, -1, -1, 15)
        self.verticalLayout.setObjectName("verticalLayout")
        self.label_2 = QtWidgets.QLabel(CreatePrivateKeyForm)
        font = QtGui.QFont()
        font.setPointSize(10)
        font.setBold(False)
        font.setWeight(50)
        self.label_2.setFont(font)
        self.label_2.setObjectName("label_2")
        self.verticalLayout.addWidget(self.label_2)
        self.password = QtWidgets.QLineEdit(CreatePrivateKeyForm)
        self.password.setEchoMode(QtWidgets.QLineEdit.Password)
        self.password.setObjectName("password")
        self.verticalLayout.addWidget(self.password)
        self.confirm_password = QtWidgets.QLineEdit(CreatePrivateKeyForm)
        self.confirm_password.setEchoMode(QtWidgets.QLineEdit.Password)
        self.confirm_password.setObjectName("confirm_password")
        self.verticalLayout.addWidget(self.confirm_password)
        self.verticalLayout_2.addLayout(self.verticalLayout)
        self.label = QtWidgets.QLabel(CreatePrivateKeyForm)
        self.label.setObjectName("label")
        self.verticalLayout_2.addWidget(self.label)
        self.alias = QtWidgets.QLineEdit(CreatePrivateKeyForm)
        self.alias.setObjectName("alias")
        self.verticalLayout_2.addWidget(self.alias)
        spacerItem1 = QtWidgets.QSpacerItem(20, 40, QtWidgets.QSizePolicy.Minimum, QtWidgets.QSizePolicy.Expanding)
        self.verticalLayout_2.addItem(spacerItem1)
        self.horizontalLayout = QtWidgets.QHBoxLayout()
        self.horizontalLayout.setObjectName("horizontalLayout")
        spacerItem2 = QtWidgets.QSpacerItem(40, 20, QtWidgets.QSizePolicy.Expanding, QtWidgets.QSizePolicy.Minimum)
        self.horizontalLayout.addItem(spacerItem2)
        self.btn_cancel = QtWidgets.QPushButton(CreatePrivateKeyForm)
        font = QtGui.QFont()
        font.setPointSize(10)
        self.btn_cancel.setFont(font)
        self.btn_cancel.setStyleSheet("height: 25px")
        self.btn_cancel.setObjectName("btn_cancel")
        self.horizontalLayout.addWidget(self.btn_cancel)
        self.btn_create = QtWidgets.QPushButton(CreatePrivateKeyForm)
        font = QtGui.QFont()
        font.setPointSize(10)
        font.setBold(True)
        font.setWeight(75)
        self.btn_create.setFont(font)
        self.btn_create.setStyleSheet("height: 25px; color: green;")
        self.btn_create.setDefault(True)
        self.btn_create.setObjectName("btn_create")
        self.horizontalLayout.addWidget(self.btn_create)
        self.verticalLayout_2.addLayout(self.horizontalLayout)

        self.retranslateUi(CreatePrivateKeyForm)
        QtCore.QMetaObject.connectSlotsByName(CreatePrivateKeyForm)

    def retranslateUi(self, CreatePrivateKeyForm):
        _translate = QtCore.QCoreApplication.translate
        CreatePrivateKeyForm.setWindowTitle(_translate("CreatePrivateKeyForm", "Create private key"))
        self.form_title.setText(_translate("CreatePrivateKeyForm", "Create private key"))
        self.label_2.setText(_translate("CreatePrivateKeyForm", "Private key password:"))
        self.password.setPlaceholderText(_translate("CreatePrivateKeyForm", "Enter private key password here..."))
        self.confirm_password.setPlaceholderText(_translate("CreatePrivateKeyForm", "Re-enter the password..."))
        self.label.setText(_translate("CreatePrivateKeyForm", "Key alias (optional): "))
        self.alias.setPlaceholderText(_translate("CreatePrivateKeyForm", "Enter alias here..."))
        self.btn_cancel.setText(_translate("CreatePrivateKeyForm", "Cancel"))
        self.btn_create.setText(_translate("CreatePrivateKeyForm", "Create"))

