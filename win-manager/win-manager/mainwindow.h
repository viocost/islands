#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <qsystemtrayicon.h>
#include "islandmanager.h"


namespace Ui {
  class MainWindow;  
}


class QSystemTrayIcon;

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    explicit MainWindow(QWidget *parent = nullptr);
    ~MainWindow();


protected:
    void closeEvent(QCloseEvent * event);

private slots:
    void iconActivated(QSystemTrayIcon::ActivationReason reason);

    void on_pushButton_clicked();

    void on_pushButton_2_clicked();

private:
    Ui::MainWindow *ui;
    QSystemTrayIcon *mSystemTrayIcon;
    QAction *minimizeAction;
    QAction *quitAction;
    QAction *launchIslandAction;
    QAction *shudownIslandAction;
    QAction *restartIslandAction;
    QMenu *trayIconMenu;




};

#endif // MAINWINDOW_H
