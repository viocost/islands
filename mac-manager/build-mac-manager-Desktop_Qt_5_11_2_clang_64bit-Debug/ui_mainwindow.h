/********************************************************************************
** Form generated from reading UI file 'mainwindow.ui'
**
** Created by: Qt User Interface Compiler version 5.11.2
**
** WARNING! All changes made in this file will be lost when recompiling UI file!
********************************************************************************/

#ifndef UI_MAINWINDOW_H
#define UI_MAINWINDOW_H

#include <QtCore/QLocale>
#include <QtCore/QVariant>
#include <QtGui/QIcon>
#include <QtWidgets/QAction>
#include <QtWidgets/QApplication>
#include <QtWidgets/QFormLayout>
#include <QtWidgets/QHBoxLayout>
#include <QtWidgets/QLabel>
#include <QtWidgets/QLineEdit>
#include <QtWidgets/QMainWindow>
#include <QtWidgets/QMenu>
#include <QtWidgets/QMenuBar>
#include <QtWidgets/QPushButton>
#include <QtWidgets/QStatusBar>
#include <QtWidgets/QTabWidget>
#include <QtWidgets/QVBoxLayout>
#include <QtWidgets/QWidget>

QT_BEGIN_NAMESPACE

class Ui_MainWindow
{
public:
    QAction *actionExit;
    QAction *actionMinimize;
    QWidget *centralWidget;
    QHBoxLayout *horizontalLayout;
    QTabWidget *tabWidget;
    QWidget *tabIslandManagement;
    QVBoxLayout *verticalLayout;
    QHBoxLayout *horizontalLayout_3;
    QLabel *islandStatusLabel;
    QLabel *islandStatus;
    QHBoxLayout *horizontalLayout_4;
    QPushButton *launchIslandButton;
    QPushButton *shutdownIslandButton;
    QPushButton *restartIslandButton;
    QWidget *tabIslandSettings;
    QWidget *formLayoutWidget;
    QFormLayout *formLayout;
    QLabel *vMnameLabel;
    QLineEdit *vMnameLineEdit;
    QLabel *vMIdLabel;
    QLineEdit *vMIdLineEdit;
    QLabel *pathToVboxmanageLabel;
    QLineEdit *pathToVboxmanageLineEdit;
    QMenuBar *menuBar;
    QMenu *menuOptions;
    QStatusBar *statusBar;

    void setupUi(QMainWindow *MainWindow)
    {
        if (MainWindow->objectName().isEmpty())
            MainWindow->setObjectName(QStringLiteral("MainWindow"));
        MainWindow->resize(640, 480);
        MainWindow->setMinimumSize(QSize(640, 480));
        QFont font;
        font.setPointSize(10);
        MainWindow->setFont(font);
        QIcon icon;
        icon.addFile(QStringLiteral(":/images/resources/island.ico"), QSize(), QIcon::Normal, QIcon::Off);
        MainWindow->setWindowIcon(icon);
        MainWindow->setLocale(QLocale(QLocale::English, QLocale::UnitedStates));
        actionExit = new QAction(MainWindow);
        actionExit->setObjectName(QStringLiteral("actionExit"));
        actionMinimize = new QAction(MainWindow);
        actionMinimize->setObjectName(QStringLiteral("actionMinimize"));
        centralWidget = new QWidget(MainWindow);
        centralWidget->setObjectName(QStringLiteral("centralWidget"));
        horizontalLayout = new QHBoxLayout(centralWidget);
        horizontalLayout->setSpacing(6);
        horizontalLayout->setContentsMargins(11, 11, 11, 11);
        horizontalLayout->setObjectName(QStringLiteral("horizontalLayout"));
        tabWidget = new QTabWidget(centralWidget);
        tabWidget->setObjectName(QStringLiteral("tabWidget"));
        tabIslandManagement = new QWidget();
        tabIslandManagement->setObjectName(QStringLiteral("tabIslandManagement"));
        verticalLayout = new QVBoxLayout(tabIslandManagement);
        verticalLayout->setSpacing(6);
        verticalLayout->setContentsMargins(11, 11, 11, 11);
        verticalLayout->setObjectName(QStringLiteral("verticalLayout"));
        horizontalLayout_3 = new QHBoxLayout();
        horizontalLayout_3->setSpacing(6);
        horizontalLayout_3->setObjectName(QStringLiteral("horizontalLayout_3"));
        islandStatusLabel = new QLabel(tabIslandManagement);
        islandStatusLabel->setObjectName(QStringLiteral("islandStatusLabel"));
        QSizePolicy sizePolicy(QSizePolicy::Preferred, QSizePolicy::Preferred);
        sizePolicy.setHorizontalStretch(0);
        sizePolicy.setVerticalStretch(0);
        sizePolicy.setHeightForWidth(islandStatusLabel->sizePolicy().hasHeightForWidth());
        islandStatusLabel->setSizePolicy(sizePolicy);
        QFont font1;
        font1.setPointSize(20);
        islandStatusLabel->setFont(font1);
        islandStatusLabel->setAlignment(Qt::AlignRight|Qt::AlignTop|Qt::AlignTrailing);

        horizontalLayout_3->addWidget(islandStatusLabel);

        islandStatus = new QLabel(tabIslandManagement);
        islandStatus->setObjectName(QStringLiteral("islandStatus"));
        QSizePolicy sizePolicy1(QSizePolicy::Fixed, QSizePolicy::Preferred);
        sizePolicy1.setHorizontalStretch(0);
        sizePolicy1.setVerticalStretch(0);
        sizePolicy1.setHeightForWidth(islandStatus->sizePolicy().hasHeightForWidth());
        islandStatus->setSizePolicy(sizePolicy1);
        QPalette palette;
        QBrush brush(QColor(173, 173, 173, 255));
        brush.setStyle(Qt::SolidPattern);
        palette.setBrush(QPalette::Active, QPalette::WindowText, brush);
        palette.setBrush(QPalette::Inactive, QPalette::WindowText, brush);
        QBrush brush1(QColor(120, 120, 120, 255));
        brush1.setStyle(Qt::SolidPattern);
        palette.setBrush(QPalette::Disabled, QPalette::WindowText, brush1);
        islandStatus->setPalette(palette);
        islandStatus->setFont(font1);
        islandStatus->setAlignment(Qt::AlignRight|Qt::AlignTop|Qt::AlignTrailing);

        horizontalLayout_3->addWidget(islandStatus);


        verticalLayout->addLayout(horizontalLayout_3);

        horizontalLayout_4 = new QHBoxLayout();
        horizontalLayout_4->setSpacing(6);
        horizontalLayout_4->setObjectName(QStringLiteral("horizontalLayout_4"));
        launchIslandButton = new QPushButton(tabIslandManagement);
        launchIslandButton->setObjectName(QStringLiteral("launchIslandButton"));
        QSizePolicy sizePolicy2(QSizePolicy::Minimum, QSizePolicy::Preferred);
        sizePolicy2.setHorizontalStretch(0);
        sizePolicy2.setVerticalStretch(0);
        sizePolicy2.setHeightForWidth(launchIslandButton->sizePolicy().hasHeightForWidth());
        launchIslandButton->setSizePolicy(sizePolicy2);

        horizontalLayout_4->addWidget(launchIslandButton);

        shutdownIslandButton = new QPushButton(tabIslandManagement);
        shutdownIslandButton->setObjectName(QStringLiteral("shutdownIslandButton"));
        sizePolicy2.setHeightForWidth(shutdownIslandButton->sizePolicy().hasHeightForWidth());
        shutdownIslandButton->setSizePolicy(sizePolicy2);

        horizontalLayout_4->addWidget(shutdownIslandButton);

        restartIslandButton = new QPushButton(tabIslandManagement);
        restartIslandButton->setObjectName(QStringLiteral("restartIslandButton"));
        sizePolicy2.setHeightForWidth(restartIslandButton->sizePolicy().hasHeightForWidth());
        restartIslandButton->setSizePolicy(sizePolicy2);

        horizontalLayout_4->addWidget(restartIslandButton);


        verticalLayout->addLayout(horizontalLayout_4);

        tabWidget->addTab(tabIslandManagement, QString());
        tabIslandSettings = new QWidget();
        tabIslandSettings->setObjectName(QStringLiteral("tabIslandSettings"));
        formLayoutWidget = new QWidget(tabIslandSettings);
        formLayoutWidget->setObjectName(QStringLiteral("formLayoutWidget"));
        formLayoutWidget->setGeometry(QRect(9, 9, 471, 361));
        formLayout = new QFormLayout(formLayoutWidget);
        formLayout->setSpacing(6);
        formLayout->setContentsMargins(11, 11, 11, 11);
        formLayout->setObjectName(QStringLiteral("formLayout"));
        formLayout->setContentsMargins(0, 0, 0, 0);
        vMnameLabel = new QLabel(formLayoutWidget);
        vMnameLabel->setObjectName(QStringLiteral("vMnameLabel"));

        formLayout->setWidget(0, QFormLayout::LabelRole, vMnameLabel);

        vMnameLineEdit = new QLineEdit(formLayoutWidget);
        vMnameLineEdit->setObjectName(QStringLiteral("vMnameLineEdit"));

        formLayout->setWidget(0, QFormLayout::FieldRole, vMnameLineEdit);

        vMIdLabel = new QLabel(formLayoutWidget);
        vMIdLabel->setObjectName(QStringLiteral("vMIdLabel"));

        formLayout->setWidget(1, QFormLayout::LabelRole, vMIdLabel);

        vMIdLineEdit = new QLineEdit(formLayoutWidget);
        vMIdLineEdit->setObjectName(QStringLiteral("vMIdLineEdit"));

        formLayout->setWidget(1, QFormLayout::FieldRole, vMIdLineEdit);

        pathToVboxmanageLabel = new QLabel(formLayoutWidget);
        pathToVboxmanageLabel->setObjectName(QStringLiteral("pathToVboxmanageLabel"));

        formLayout->setWidget(2, QFormLayout::LabelRole, pathToVboxmanageLabel);

        pathToVboxmanageLineEdit = new QLineEdit(formLayoutWidget);
        pathToVboxmanageLineEdit->setObjectName(QStringLiteral("pathToVboxmanageLineEdit"));

        formLayout->setWidget(2, QFormLayout::FieldRole, pathToVboxmanageLineEdit);

        tabWidget->addTab(tabIslandSettings, QString());

        horizontalLayout->addWidget(tabWidget);

        MainWindow->setCentralWidget(centralWidget);
        menuBar = new QMenuBar(MainWindow);
        menuBar->setObjectName(QStringLiteral("menuBar"));
        menuBar->setGeometry(QRect(0, 0, 640, 22));
        menuOptions = new QMenu(menuBar);
        menuOptions->setObjectName(QStringLiteral("menuOptions"));
        MainWindow->setMenuBar(menuBar);
        statusBar = new QStatusBar(MainWindow);
        statusBar->setObjectName(QStringLiteral("statusBar"));
        statusBar->setLocale(QLocale(QLocale::English, QLocale::UnitedStates));
        MainWindow->setStatusBar(statusBar);

        menuBar->addAction(menuOptions->menuAction());
        menuOptions->addAction(actionMinimize);
        menuOptions->addAction(actionExit);

        retranslateUi(MainWindow);

        tabWidget->setCurrentIndex(0);


        QMetaObject::connectSlotsByName(MainWindow);
    } // setupUi

    void retranslateUi(QMainWindow *MainWindow)
    {
        MainWindow->setWindowTitle(QApplication::translate("MainWindow", "Island Manager", nullptr));
        actionExit->setText(QApplication::translate("MainWindow", "Exit", nullptr));
        actionMinimize->setText(QApplication::translate("MainWindow", "Minimize", nullptr));
        islandStatusLabel->setText(QApplication::translate("MainWindow", "Island status: ", nullptr));
        islandStatus->setText(QApplication::translate("MainWindow", "unknown", nullptr));
        launchIslandButton->setText(QApplication::translate("MainWindow", "Launch Island", nullptr));
        shutdownIslandButton->setText(QApplication::translate("MainWindow", "Shutdown Island", nullptr));
        restartIslandButton->setText(QApplication::translate("MainWindow", "Restart Island", nullptr));
        tabWidget->setTabText(tabWidget->indexOf(tabIslandManagement), QApplication::translate("MainWindow", "Manage", nullptr));
        vMnameLabel->setText(QApplication::translate("MainWindow", "Island VM name:", nullptr));
        vMIdLabel->setText(QApplication::translate("MainWindow", "Island VM id:", nullptr));
        pathToVboxmanageLabel->setText(QApplication::translate("MainWindow", "Path to vboxmanage:", nullptr));
        tabWidget->setTabText(tabWidget->indexOf(tabIslandSettings), QApplication::translate("MainWindow", "Settings", nullptr));
        menuOptions->setTitle(QApplication::translate("MainWindow", "Menu", nullptr));
    } // retranslateUi

};

namespace Ui {
    class MainWindow: public Ui_MainWindow {};
} // namespace Ui

QT_END_NAMESPACE

#endif // UI_MAINWINDOW_H
