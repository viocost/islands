#include <iostream>
#include <QCloseEvent>
#include <QStyle>

#include "mainwindow.h"
#include "ui_mainwindow.h"

#include "islandmanager.h"

MainWindow::MainWindow(QWidget *parent) :
    QMainWindow(parent),
    ui(new Ui::MainWindow)
{
    ui->setupUi(this);
    mSystemTrayIcon = new QSystemTrayIcon(this);
    mSystemTrayIcon->setIcon(QIcon(":/images/island.png"));
    mSystemTrayIcon->setToolTip("Island Manager tray" "\n"
                                    "Another line");
    this->islandManager = new IslandManager();
    QMenu * menu = new QMenu(this);
    QAction * viewWindow = new QAction("Show manager", this);
    QAction * exitIslandManager = new QAction("Exit", this);

    connect(viewWindow, SIGNAL(triggered()), this, SLOT(show()));
    connect(exitIslandManager, SIGNAL(triggered()), this, SLOT(close()));

    menu->addAction(viewWindow);
    menu->addAction(exitIslandManager);

    mSystemTrayIcon->setContextMenu(menu);
    mSystemTrayIcon->show();

    connect(mSystemTrayIcon, SIGNAL(activated(QSystemTrayIcon::ActivationReason)),
                this, SLOT(iconActivated(QSystemTrayIcon::ActivationReason)));


}

MainWindow::~MainWindow()
{
    delete ui;
    delete islandManager;
}


void MainWindow::iconActivated(QSystemTrayIcon::ActivationReason reason)
{

    std::cout<<"Icon activated\n"<<reason;
}

void MainWindow::closeEvent(QCloseEvent * event)
{

    if(this->isVisible()) {
        event->ignore();
        this->hide();
        QSystemTrayIcon::MessageIcon icon = QSystemTrayIcon::MessageIcon(QSystemTrayIcon::Information);
        mSystemTrayIcon->showMessage("Island manager", "Island manager has been minimized", icon, 2000);
    }
}

void MainWindow::on_launchIslandButton_clicked()
{
    this->islandManager->launchIsland();
    this->updateIslandStatus();
}

void MainWindow::on_shutdownIslandButton_clicked()
{
    this->islandManager->shutdownIsland();
    this->updateIslandStatus();
}

void MainWindow::on_restartIslandButton_clicked()
{
    this->islandManager->restartIsland();
    this->updateIslandStatus();
}


void MainWindow::updateIslandStatus(){
    if(this->islandManager->isIslandRunning()){
        ui->islandStatus->setText("Running");
        ui->islandStatus->setStyleSheet("QLabel {color: green;}");
    }else{
        ui->islandStatus->setText("Not running");
        ui->islandStatus->setStyleSheet("QLabel {color: red;}");
    }
}



