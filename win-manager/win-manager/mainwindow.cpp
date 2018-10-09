
#include "mainwindow.h"
#include "ui_mainwindow.h"

MainWindow::MainWindow(QWidget *parent) :
    QMainWindow(parent),
    ui(new Ui::MainWindow)
{
    ui->setupUi(this);
    mSystemTrayIcon = new QSystemTrayIcon(this);
    mSystemTrayIcon->setIcon(QIcon(":/island.png"));
    mSystemTrayIcon->setVisible(true);




}


MainWindow::~MainWindow()
{
    delete ui;
}

void MainWindow::on_pushButton_clicked()
{


    ui->statusBar->showMessage("you clicked me!", 5000);
}

void MainWindow::on_pushButton_2_clicked()
{
    ui->statusBar->showMessage("Island shutdown!", 5000);
}
