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
#include <QtWidgets/QHBoxLayout>
#include <QtWidgets/QLabel>
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
    QLabel *label;
    QLabel *label_2;
    QHBoxLayout *horizontalLayout_4;
    QPushButton *pushButton_2;
    QPushButton *pushButton;
    QPushButton *pushButton_3;
    QWidget *tabIslandSettings;
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
        label = new QLabel(tabIslandManagement);
        label->setObjectName(QStringLiteral("label"));
        QSizePolicy sizePolicy(QSizePolicy::Preferred, QSizePolicy::Preferred);
        sizePolicy.setHorizontalStretch(0);
        sizePolicy.setVerticalStretch(0);
        sizePolicy.setHeightForWidth(label->sizePolicy().hasHeightForWidth());
        label->setSizePolicy(sizePolicy);
        QFont font1;
        font1.setPointSize(20);
        label->setFont(font1);
        label->setAlignment(Qt::AlignRight|Qt::AlignTop|Qt::AlignTrailing);

        horizontalLayout_3->addWidget(label);

        label_2 = new QLabel(tabIslandManagement);
        label_2->setObjectName(QStringLiteral("label_2"));
        QSizePolicy sizePolicy1(QSizePolicy::Fixed, QSizePolicy::Preferred);
        sizePolicy1.setHorizontalStretch(0);
        sizePolicy1.setVerticalStretch(0);
        sizePolicy1.setHeightForWidth(label_2->sizePolicy().hasHeightForWidth());
        label_2->setSizePolicy(sizePolicy1);
        QPalette palette;
        QBrush brush(QColor(173, 173, 173, 255));
        brush.setStyle(Qt::SolidPattern);
        palette.setBrush(QPalette::Active, QPalette::WindowText, brush);
        palette.setBrush(QPalette::Inactive, QPalette::WindowText, brush);
        QBrush brush1(QColor(120, 120, 120, 255));
        brush1.setStyle(Qt::SolidPattern);
        palette.setBrush(QPalette::Disabled, QPalette::WindowText, brush1);
        label_2->setPalette(palette);
        label_2->setFont(font1);
        label_2->setAlignment(Qt::AlignRight|Qt::AlignTop|Qt::AlignTrailing);

        horizontalLayout_3->addWidget(label_2);


        verticalLayout->addLayout(horizontalLayout_3);

        horizontalLayout_4 = new QHBoxLayout();
        horizontalLayout_4->setSpacing(6);
        horizontalLayout_4->setObjectName(QStringLiteral("horizontalLayout_4"));
        pushButton_2 = new QPushButton(tabIslandManagement);
        pushButton_2->setObjectName(QStringLiteral("pushButton_2"));
        QSizePolicy sizePolicy2(QSizePolicy::Minimum, QSizePolicy::Preferred);
        sizePolicy2.setHorizontalStretch(0);
        sizePolicy2.setVerticalStretch(0);
        sizePolicy2.setHeightForWidth(pushButton_2->sizePolicy().hasHeightForWidth());
        pushButton_2->setSizePolicy(sizePolicy2);

        horizontalLayout_4->addWidget(pushButton_2);

        pushButton = new QPushButton(tabIslandManagement);
        pushButton->setObjectName(QStringLiteral("pushButton"));
        sizePolicy2.setHeightForWidth(pushButton->sizePolicy().hasHeightForWidth());
        pushButton->setSizePolicy(sizePolicy2);

        horizontalLayout_4->addWidget(pushButton);

        pushButton_3 = new QPushButton(tabIslandManagement);
        pushButton_3->setObjectName(QStringLiteral("pushButton_3"));
        sizePolicy2.setHeightForWidth(pushButton_3->sizePolicy().hasHeightForWidth());
        pushButton_3->setSizePolicy(sizePolicy2);

        horizontalLayout_4->addWidget(pushButton_3);


        verticalLayout->addLayout(horizontalLayout_4);

        tabWidget->addTab(tabIslandManagement, QString());
        tabIslandSettings = new QWidget();
        tabIslandSettings->setObjectName(QStringLiteral("tabIslandSettings"));
        tabWidget->addTab(tabIslandSettings, QString());

        horizontalLayout->addWidget(tabWidget);

        MainWindow->setCentralWidget(centralWidget);
        menuBar = new QMenuBar(MainWindow);
        menuBar->setObjectName(QStringLiteral("menuBar"));
        menuBar->setGeometry(QRect(0, 0, 640, 23));
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
        label->setText(QApplication::translate("MainWindow", "Island status: ", nullptr));
        label_2->setText(QApplication::translate("MainWindow", "unknown", nullptr));
        pushButton_2->setText(QApplication::translate("MainWindow", "Launch Island", nullptr));
        pushButton->setText(QApplication::translate("MainWindow", "Shutdown Island", nullptr));
        pushButton_3->setText(QApplication::translate("MainWindow", "Restart Island", nullptr));
        tabWidget->setTabText(tabWidget->indexOf(tabIslandManagement), QApplication::translate("MainWindow", "Manage", nullptr));
        tabWidget->setTabText(tabWidget->indexOf(tabIslandSettings), QApplication::translate("MainWindow", "Settings", nullptr));
        menuOptions->setTitle(QApplication::translate("MainWindow", "Menu", nullptr));
    } // retranslateUi

};

namespace Ui {
    class MainWindow: public Ui_MainWindow {};
} // namespace Ui

QT_END_NAMESPACE

#endif // UI_MAINWINDOW_H
