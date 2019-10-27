# -*- coding: utf-8 -*-

# Form implementation generated from reading ui file '../views/image_authoring_form/image_authoring_form.ui'
#
# Created by: PyQt5 UI code generator 5.12.2
#
# WARNING! All changes made in this file will be lost!

from PyQt5 import QtCore, QtGui, QtWidgets


class Ui_ImageAuthoringForm(object):
    def setupUi(self, ImageAuthoringForm):
        ImageAuthoringForm.setObjectName("ImageAuthoringForm")
        ImageAuthoringForm.setWindowModality(QtCore.Qt.WindowModal)
        ImageAuthoringForm.resize(976, 636)
        self.verticalLayout_12 = QtWidgets.QVBoxLayout(ImageAuthoringForm)
        self.verticalLayout_12.setObjectName("verticalLayout_12")
        self.form_title = QtWidgets.QLabel(ImageAuthoringForm)
        sizePolicy = QtWidgets.QSizePolicy(QtWidgets.QSizePolicy.Preferred, QtWidgets.QSizePolicy.Maximum)
        sizePolicy.setHorizontalStretch(0)
        sizePolicy.setVerticalStretch(0)
        sizePolicy.setHeightForWidth(self.form_title.sizePolicy().hasHeightForWidth())
        self.form_title.setSizePolicy(sizePolicy)
        font = QtGui.QFont()
        font.setPointSize(26)
        self.form_title.setFont(font)
        self.form_title.setObjectName("form_title")
        self.verticalLayout_12.addWidget(self.form_title)
        self.horizontalLayout_15 = QtWidgets.QHBoxLayout()
        self.horizontalLayout_15.setSpacing(63)
        self.horizontalLayout_15.setObjectName("horizontalLayout_15")
        self.verticalLayout_11 = QtWidgets.QVBoxLayout()
        self.verticalLayout_11.setSpacing(53)
        self.verticalLayout_11.setObjectName("verticalLayout_11")
        self.groupBox = QtWidgets.QGroupBox(ImageAuthoringForm)
        sizePolicy = QtWidgets.QSizePolicy(QtWidgets.QSizePolicy.Maximum, QtWidgets.QSizePolicy.Preferred)
        sizePolicy.setHorizontalStretch(0)
        sizePolicy.setVerticalStretch(0)
        sizePolicy.setHeightForWidth(self.groupBox.sizePolicy().hasHeightForWidth())
        self.groupBox.setSizePolicy(sizePolicy)
        self.groupBox.setMaximumSize(QtCore.QSize(430, 16777215))
        font = QtGui.QFont()
        font.setBold(False)
        font.setWeight(50)
        self.groupBox.setFont(font)
        self.groupBox.setFlat(False)
        self.groupBox.setObjectName("groupBox")
        self.verticalLayout_2 = QtWidgets.QVBoxLayout(self.groupBox)
        self.verticalLayout_2.setSpacing(29)
        self.verticalLayout_2.setObjectName("verticalLayout_2")
        self.verticalLayout = QtWidgets.QVBoxLayout()
        self.verticalLayout.setSpacing(5)
        self.verticalLayout.setObjectName("verticalLayout")
        self.horizontalLayout_2 = QtWidgets.QHBoxLayout()
        self.horizontalLayout_2.setObjectName("horizontalLayout_2")
        self.label = QtWidgets.QLabel(self.groupBox)
        sizePolicy = QtWidgets.QSizePolicy(QtWidgets.QSizePolicy.Minimum, QtWidgets.QSizePolicy.Preferred)
        sizePolicy.setHorizontalStretch(0)
        sizePolicy.setVerticalStretch(0)
        sizePolicy.setHeightForWidth(self.label.sizePolicy().hasHeightForWidth())
        self.label.setSizePolicy(sizePolicy)
        self.label.setObjectName("label")
        self.horizontalLayout_2.addWidget(self.label)
        self.select_private_key = QtWidgets.QComboBox(self.groupBox)
        sizePolicy = QtWidgets.QSizePolicy(QtWidgets.QSizePolicy.Preferred, QtWidgets.QSizePolicy.Fixed)
        sizePolicy.setHorizontalStretch(1)
        sizePolicy.setVerticalStretch(0)
        sizePolicy.setHeightForWidth(self.select_private_key.sizePolicy().hasHeightForWidth())
        self.select_private_key.setSizePolicy(sizePolicy)
        self.select_private_key.setCurrentText("")
        self.select_private_key.setObjectName("select_private_key")
        self.horizontalLayout_2.addWidget(self.select_private_key)
        self.verticalLayout.addLayout(self.horizontalLayout_2)
        self.horizontalLayout_6 = QtWidgets.QHBoxLayout()
        self.horizontalLayout_6.setObjectName("horizontalLayout_6")
        spacerItem = QtWidgets.QSpacerItem(40, 20, QtWidgets.QSizePolicy.Expanding, QtWidgets.QSizePolicy.Minimum)
        self.horizontalLayout_6.addItem(spacerItem)
        self.private_key_password = QtWidgets.QLineEdit(self.groupBox)
        self.private_key_password.setEchoMode(QtWidgets.QLineEdit.Password)
        self.private_key_password.setObjectName("private_key_password")
        self.horizontalLayout_6.addWidget(self.private_key_password)
        self.verticalLayout.addLayout(self.horizontalLayout_6)
        self.verticalLayout_2.addLayout(self.verticalLayout)
        self.horizontalLayout_7 = QtWidgets.QHBoxLayout()
        self.horizontalLayout_7.setObjectName("horizontalLayout_7")
        self.label_2 = QtWidgets.QLabel(self.groupBox)
        self.label_2.setMaximumSize(QtCore.QSize(60, 16777215))
        self.label_2.setObjectName("label_2")
        self.horizontalLayout_7.addWidget(self.label_2)
        self.select_artifact = QtWidgets.QComboBox(self.groupBox)
        self.select_artifact.setObjectName("select_artifact")
        self.horizontalLayout_7.addWidget(self.select_artifact)
        self.btn_create_artifact = QtWidgets.QPushButton(self.groupBox)
        self.btn_create_artifact.setMaximumSize(QtCore.QSize(144, 16777215))
        self.btn_create_artifact.setFocusPolicy(QtCore.Qt.NoFocus)
        self.btn_create_artifact.setObjectName("btn_create_artifact")
        self.horizontalLayout_7.addWidget(self.btn_create_artifact)
        self.verticalLayout_2.addLayout(self.horizontalLayout_7)
        self.verticalLayout_11.addWidget(self.groupBox)
        self.groupBox_3 = QtWidgets.QGroupBox(ImageAuthoringForm)
        self.groupBox_3.setEnabled(False)
        sizePolicy = QtWidgets.QSizePolicy(QtWidgets.QSizePolicy.Maximum, QtWidgets.QSizePolicy.Preferred)
        sizePolicy.setHorizontalStretch(0)
        sizePolicy.setVerticalStretch(0)
        sizePolicy.setHeightForWidth(self.groupBox_3.sizePolicy().hasHeightForWidth())
        self.groupBox_3.setSizePolicy(sizePolicy)
        self.groupBox_3.setMaximumSize(QtCore.QSize(430, 16777215))
        self.groupBox_3.setObjectName("groupBox_3")
        self.verticalLayout_9 = QtWidgets.QVBoxLayout(self.groupBox_3)
        self.verticalLayout_9.setObjectName("verticalLayout_9")
        self.verticalLayout_3 = QtWidgets.QVBoxLayout()
        self.verticalLayout_3.setSpacing(6)
        self.verticalLayout_3.setObjectName("verticalLayout_3")
        self.horizontalLayout_10 = QtWidgets.QHBoxLayout()
        self.horizontalLayout_10.setObjectName("horizontalLayout_10")
        self.label_4 = QtWidgets.QLabel(self.groupBox_3)
        self.label_4.setObjectName("label_4")
        self.horizontalLayout_10.addWidget(self.label_4)
        self.publisher = QtWidgets.QLineEdit(self.groupBox_3)
        self.publisher.setObjectName("publisher")
        self.horizontalLayout_10.addWidget(self.publisher)
        self.verticalLayout_3.addLayout(self.horizontalLayout_10)
        self.horizontalLayout_9 = QtWidgets.QHBoxLayout()
        self.horizontalLayout_9.setObjectName("horizontalLayout_9")
        self.label_5 = QtWidgets.QLabel(self.groupBox_3)
        self.label_5.setObjectName("label_5")
        self.horizontalLayout_9.addWidget(self.label_5)
        self.publisher_email = QtWidgets.QLineEdit(self.groupBox_3)
        self.publisher_email.setObjectName("publisher_email")
        self.horizontalLayout_9.addWidget(self.publisher_email)
        self.verticalLayout_3.addLayout(self.horizontalLayout_9)
        self.horizontalLayout_11 = QtWidgets.QHBoxLayout()
        self.horizontalLayout_11.setObjectName("horizontalLayout_11")
        self.label_6 = QtWidgets.QLabel(self.groupBox_3)
        self.label_6.setObjectName("label_6")
        self.horizontalLayout_11.addWidget(self.label_6)
        self.note = QtWidgets.QLineEdit(self.groupBox_3)
        self.note.setText("")
        self.note.setObjectName("note")
        self.horizontalLayout_11.addWidget(self.note)
        self.verticalLayout_3.addLayout(self.horizontalLayout_11)
        self.verticalLayout_9.addLayout(self.verticalLayout_3)
        self.line = QtWidgets.QFrame(self.groupBox_3)
        self.line.setFrameShape(QtWidgets.QFrame.HLine)
        self.line.setFrameShadow(QtWidgets.QFrame.Sunken)
        self.line.setObjectName("line")
        self.verticalLayout_9.addWidget(self.line)
        self.verticalLayout_6 = QtWidgets.QVBoxLayout()
        self.verticalLayout_6.setObjectName("verticalLayout_6")
        self.horizontalLayout_8 = QtWidgets.QHBoxLayout()
        self.horizontalLayout_8.setObjectName("horizontalLayout_8")
        self.label_11 = QtWidgets.QLabel(self.groupBox_3)
        self.label_11.setObjectName("label_11")
        self.horizontalLayout_8.addWidget(self.label_11)
        self.lbl_previous_img_version = QtWidgets.QLabel(self.groupBox_3)
        font = QtGui.QFont()
        font.setItalic(True)
        self.lbl_previous_img_version.setFont(font)
        self.lbl_previous_img_version.setObjectName("lbl_previous_img_version")
        self.horizontalLayout_8.addWidget(self.lbl_previous_img_version)
        spacerItem1 = QtWidgets.QSpacerItem(40, 20, QtWidgets.QSizePolicy.Expanding, QtWidgets.QSizePolicy.Minimum)
        self.horizontalLayout_8.addItem(spacerItem1)
        self.verticalLayout_6.addLayout(self.horizontalLayout_8)
        self.horizontalLayout_13 = QtWidgets.QHBoxLayout()
        self.horizontalLayout_13.setObjectName("horizontalLayout_13")
        self.label_8 = QtWidgets.QLabel(self.groupBox_3)
        self.label_8.setObjectName("label_8")
        self.horizontalLayout_13.addWidget(self.label_8)
        self.image_version = QtWidgets.QLineEdit(self.groupBox_3)
        self.image_version.setMinimumSize(QtCore.QSize(60, 0))
        self.image_version.setMaximumSize(QtCore.QSize(70, 16777215))
        self.image_version.setObjectName("image_version")
        self.horizontalLayout_13.addWidget(self.image_version)
        self.label_9 = QtWidgets.QLabel(self.groupBox_3)
        self.label_9.setObjectName("label_9")
        self.horizontalLayout_13.addWidget(self.label_9)
        self.image_release = QtWidgets.QLineEdit(self.groupBox_3)
        self.image_release.setMinimumSize(QtCore.QSize(60, 0))
        self.image_release.setMaximumSize(QtCore.QSize(70, 16777215))
        self.image_release.setObjectName("image_release")
        self.horizontalLayout_13.addWidget(self.image_release)
        self.label_10 = QtWidgets.QLabel(self.groupBox_3)
        self.label_10.setObjectName("label_10")
        self.horizontalLayout_13.addWidget(self.label_10)
        self.image_modification = QtWidgets.QLineEdit(self.groupBox_3)
        self.image_modification.setMinimumSize(QtCore.QSize(95, 0))
        self.image_modification.setMaximumSize(QtCore.QSize(95, 16777215))
        self.image_modification.setObjectName("image_modification")
        self.horizontalLayout_13.addWidget(self.image_modification)
        spacerItem2 = QtWidgets.QSpacerItem(40, 20, QtWidgets.QSizePolicy.Expanding, QtWidgets.QSizePolicy.Minimum)
        self.horizontalLayout_13.addItem(spacerItem2)
        self.verticalLayout_6.addLayout(self.horizontalLayout_13)
        self.verticalLayout_9.addLayout(self.verticalLayout_6)
        self.verticalLayout_11.addWidget(self.groupBox_3)
        self.horizontalLayout_15.addLayout(self.verticalLayout_11)
        self.verticalLayout_10 = QtWidgets.QVBoxLayout()
        self.verticalLayout_10.setSpacing(70)
        self.verticalLayout_10.setObjectName("verticalLayout_10")
        self.groupBox_2 = QtWidgets.QGroupBox(ImageAuthoringForm)
        self.groupBox_2.setEnabled(False)
        sizePolicy = QtWidgets.QSizePolicy(QtWidgets.QSizePolicy.Preferred, QtWidgets.QSizePolicy.Maximum)
        sizePolicy.setHorizontalStretch(0)
        sizePolicy.setVerticalStretch(0)
        sizePolicy.setHeightForWidth(self.groupBox_2.sizePolicy().hasHeightForWidth())
        self.groupBox_2.setSizePolicy(sizePolicy)
        self.groupBox_2.setObjectName("groupBox_2")
        self.verticalLayout_7 = QtWidgets.QVBoxLayout(self.groupBox_2)
        self.verticalLayout_7.setSpacing(30)
        self.verticalLayout_7.setObjectName("verticalLayout_7")
        self.horizontalLayout = QtWidgets.QHBoxLayout()
        self.horizontalLayout.setSizeConstraint(QtWidgets.QLayout.SetDefaultConstraint)
        self.horizontalLayout.setObjectName("horizontalLayout")
        self.source_file = QtWidgets.QLineEdit(self.groupBox_2)
        self.source_file.setObjectName("source_file")
        self.horizontalLayout.addWidget(self.source_file)
        self.btn_select_source = QtWidgets.QPushButton(self.groupBox_2)
        self.btn_select_source.setObjectName("btn_select_source")
        self.horizontalLayout.addWidget(self.btn_select_source)
        self.verticalLayout_7.addLayout(self.horizontalLayout)
        self.verticalLayout_5 = QtWidgets.QVBoxLayout()
        self.verticalLayout_5.setSpacing(0)
        self.verticalLayout_5.setObjectName("verticalLayout_5")
        self.horizontalLayout_14 = QtWidgets.QHBoxLayout()
        self.horizontalLayout_14.setObjectName("horizontalLayout_14")
        self.label_12 = QtWidgets.QLabel(self.groupBox_2)
        self.label_12.setObjectName("label_12")
        self.horizontalLayout_14.addWidget(self.label_12)
        self.lbl_prev_islands_version = QtWidgets.QLabel(self.groupBox_2)
        font = QtGui.QFont()
        font.setItalic(True)
        self.lbl_prev_islands_version.setFont(font)
        self.lbl_prev_islands_version.setObjectName("lbl_prev_islands_version")
        self.horizontalLayout_14.addWidget(self.lbl_prev_islands_version)
        spacerItem3 = QtWidgets.QSpacerItem(40, 20, QtWidgets.QSizePolicy.Expanding, QtWidgets.QSizePolicy.Minimum)
        self.horizontalLayout_14.addItem(spacerItem3)
        self.verticalLayout_5.addLayout(self.horizontalLayout_14)
        self.horizontalLayout_4 = QtWidgets.QHBoxLayout()
        self.horizontalLayout_4.setObjectName("horizontalLayout_4")
        self.label_3 = QtWidgets.QLabel(self.groupBox_2)
        self.label_3.setObjectName("label_3")
        self.horizontalLayout_4.addWidget(self.label_3)
        self.islands_version = QtWidgets.QLineEdit(self.groupBox_2)
        self.islands_version.setObjectName("islands_version")
        self.horizontalLayout_4.addWidget(self.islands_version)
        self.verticalLayout_5.addLayout(self.horizontalLayout_4)
        self.verticalLayout_7.addLayout(self.verticalLayout_5)
        self.verticalLayout_10.addWidget(self.groupBox_2)
        spacerItem4 = QtWidgets.QSpacerItem(20, 40, QtWidgets.QSizePolicy.Minimum, QtWidgets.QSizePolicy.Expanding)
        self.verticalLayout_10.addItem(spacerItem4)
        self.groupBox_4 = QtWidgets.QGroupBox(ImageAuthoringForm)
        self.groupBox_4.setEnabled(False)
        sizePolicy = QtWidgets.QSizePolicy(QtWidgets.QSizePolicy.Preferred, QtWidgets.QSizePolicy.Maximum)
        sizePolicy.setHorizontalStretch(0)
        sizePolicy.setVerticalStretch(0)
        sizePolicy.setHeightForWidth(self.groupBox_4.sizePolicy().hasHeightForWidth())
        self.groupBox_4.setSizePolicy(sizePolicy)
        self.groupBox_4.setObjectName("groupBox_4")
        self.verticalLayout_8 = QtWidgets.QVBoxLayout(self.groupBox_4)
        self.verticalLayout_8.setSpacing(5)
        self.verticalLayout_8.setObjectName("verticalLayout_8")
        self.horizontalLayout_3 = QtWidgets.QHBoxLayout()
        self.horizontalLayout_3.setObjectName("horizontalLayout_3")
        self.path_to_dest = QtWidgets.QLineEdit(self.groupBox_4)
        self.path_to_dest.setText("")
        self.path_to_dest.setObjectName("path_to_dest")
        self.horizontalLayout_3.addWidget(self.path_to_dest)
        self.btn_select_dest_path = QtWidgets.QPushButton(self.groupBox_4)
        self.btn_select_dest_path.setObjectName("btn_select_dest_path")
        self.horizontalLayout_3.addWidget(self.btn_select_dest_path)
        self.verticalLayout_8.addLayout(self.horizontalLayout_3)
        self.horizontalLayout_12 = QtWidgets.QHBoxLayout()
        self.horizontalLayout_12.setObjectName("horizontalLayout_12")
        self.label_7 = QtWidgets.QLabel(self.groupBox_4)
        self.label_7.setObjectName("label_7")
        self.horizontalLayout_12.addWidget(self.label_7)
        self.out_filename = QtWidgets.QLineEdit(self.groupBox_4)
        self.out_filename.setObjectName("out_filename")
        self.horizontalLayout_12.addWidget(self.out_filename)
        self.verticalLayout_8.addLayout(self.horizontalLayout_12)
        self.chk_seed_now = QtWidgets.QCheckBox(self.groupBox_4)
        sizePolicy = QtWidgets.QSizePolicy(QtWidgets.QSizePolicy.Maximum, QtWidgets.QSizePolicy.Fixed)
        sizePolicy.setHorizontalStretch(0)
        sizePolicy.setVerticalStretch(0)
        sizePolicy.setHeightForWidth(self.chk_seed_now.sizePolicy().hasHeightForWidth())
        self.chk_seed_now.setSizePolicy(sizePolicy)
        self.chk_seed_now.setObjectName("chk_seed_now")
        self.verticalLayout_8.addWidget(self.chk_seed_now)
        self.verticalLayout_10.addWidget(self.groupBox_4)
        self.horizontalLayout_15.addLayout(self.verticalLayout_10)
        self.verticalLayout_12.addLayout(self.horizontalLayout_15)
        self.progress_wrap = QtWidgets.QWidget(ImageAuthoringForm)
        self.progress_wrap.setVisible(True)
        self.progress_wrap.setObjectName("progress_wrap")
        self.verticalLayout_4 = QtWidgets.QVBoxLayout(self.progress_wrap)
        self.verticalLayout_4.setObjectName("verticalLayout_4")
        self.progressBar = QtWidgets.QProgressBar(self.progress_wrap)
        self.progressBar.setProperty("value", 0)
        self.progressBar.setObjectName("progressBar")
        self.verticalLayout_4.addWidget(self.progressBar)
        self.lbl_action = QtWidgets.QLabel(self.progress_wrap)
        self.lbl_action.setText("")
        self.lbl_action.setObjectName("lbl_action")
        self.verticalLayout_4.addWidget(self.lbl_action)
        self.verticalLayout_12.addWidget(self.progress_wrap)
        self.horizontalLayout_5 = QtWidgets.QHBoxLayout()
        self.horizontalLayout_5.setSpacing(21)
        self.horizontalLayout_5.setObjectName("horizontalLayout_5")
        spacerItem5 = QtWidgets.QSpacerItem(40, 20, QtWidgets.QSizePolicy.Expanding, QtWidgets.QSizePolicy.Minimum)
        self.horizontalLayout_5.addItem(spacerItem5)
        self.btn_cancel = QtWidgets.QPushButton(ImageAuthoringForm)
        font = QtGui.QFont()
        font.setPointSize(11)
        self.btn_cancel.setFont(font)
        self.btn_cancel.setStyleSheet("height: 35px")
        self.btn_cancel.setObjectName("btn_cancel")
        self.horizontalLayout_5.addWidget(self.btn_cancel)
        self.btn_go = QtWidgets.QPushButton(ImageAuthoringForm)
        self.btn_go.setEnabled(False)
        font = QtGui.QFont()
        font.setPointSize(11)
        font.setBold(True)
        font.setWeight(75)
        self.btn_go.setFont(font)
        self.btn_go.setStyleSheet("QPushButton{\n"
"height: 35px;\n"
"}\n"
"\n"
"\n"
"QPushButton:enabled{\n"
"    color: green;\n"
"}\n"
"\n"
"QPushButton:disabled{\n"
"    color: #777;\n"
"}")
        self.btn_go.setObjectName("btn_go")
        self.horizontalLayout_5.addWidget(self.btn_go)
        self.verticalLayout_12.addLayout(self.horizontalLayout_5)

        self.retranslateUi(ImageAuthoringForm)
        QtCore.QMetaObject.connectSlotsByName(ImageAuthoringForm)

    def retranslateUi(self, ImageAuthoringForm):
        _translate = QtCore.QCoreApplication.translate
        ImageAuthoringForm.setWindowTitle(_translate("ImageAuthoringForm", "Image Authoring"))
        self.form_title.setText(_translate("ImageAuthoringForm", "Islands Image Authoring"))
        self.groupBox.setTitle(_translate("ImageAuthoringForm", "STEP 1 - Select key and branch"))
        self.label.setText(_translate("ImageAuthoringForm", "Select private key:"))
        self.private_key_password.setPlaceholderText(_translate("ImageAuthoringForm", "Private key password"))
        self.label_2.setText(_translate("ImageAuthoringForm", "Artifact:"))
        self.btn_create_artifact.setText(_translate("ImageAuthoringForm", "Create New Artifact"))
        self.groupBox_3.setTitle(_translate("ImageAuthoringForm", "STEP 3 - Check / fill the information"))
        self.label_4.setText(_translate("ImageAuthoringForm", "Your name"))
        self.publisher.setPlaceholderText(_translate("ImageAuthoringForm", "Enter your name or nickname"))
        self.label_5.setText(_translate("ImageAuthoringForm", "Your email"))
        self.publisher_email.setPlaceholderText(_translate("ImageAuthoringForm", "Enter your email"))
        self.label_6.setText(_translate("ImageAuthoringForm", "Note"))
        self.note.setPlaceholderText(_translate("ImageAuthoringForm", "Place for note"))
        self.label_11.setText(_translate("ImageAuthoringForm", "Previous version:"))
        self.lbl_previous_img_version.setText(_translate("ImageAuthoringForm", "none"))
        self.label_8.setText(_translate("ImageAuthoringForm", "New version:"))
        self.image_version.setInputMask(_translate("ImageAuthoringForm", "0000"))
        self.image_version.setPlaceholderText(_translate("ImageAuthoringForm", "Version"))
        self.label_9.setText(_translate("ImageAuthoringForm", "."))
        self.image_release.setInputMask(_translate("ImageAuthoringForm", "00"))
        self.image_release.setPlaceholderText(_translate("ImageAuthoringForm", "Release"))
        self.label_10.setText(_translate("ImageAuthoringForm", "."))
        self.image_modification.setInputMask(_translate("ImageAuthoringForm", "0000"))
        self.image_modification.setPlaceholderText(_translate("ImageAuthoringForm", "Modification"))
        self.groupBox_2.setTitle(_translate("ImageAuthoringForm", "STEP 2 - Select image file and fill Islands version"))
        self.source_file.setPlaceholderText(_translate("ImageAuthoringForm", "Path to Islands image file"))
        self.btn_select_source.setText(_translate("ImageAuthoringForm", "Select image file"))
        self.label_12.setText(_translate("ImageAuthoringForm", "Previous version: "))
        self.lbl_prev_islands_version.setText(_translate("ImageAuthoringForm", "none"))
        self.label_3.setText(_translate("ImageAuthoringForm", "Islands version:"))
        self.islands_version.setPlaceholderText(_translate("ImageAuthoringForm", "Ex.: 1.05.121"))
        self.groupBox_4.setTitle(_translate("ImageAuthoringForm", "STEP 4 - Set output options"))
        self.path_to_dest.setPlaceholderText(_translate("ImageAuthoringForm", "Path to destination folder"))
        self.btn_select_dest_path.setText(_translate("ImageAuthoringForm", "Select destination folder"))
        self.label_7.setText(_translate("ImageAuthoringForm", "Output file name:"))
        self.out_filename.setPlaceholderText(_translate("ImageAuthoringForm", "Output file name"))
        self.chk_seed_now.setText(_translate("ImageAuthoringForm", "Start seeding immediately"))
        self.btn_cancel.setText(_translate("ImageAuthoringForm", "Cancel"))
        self.btn_go.setText(_translate("ImageAuthoringForm", "GO!"))


