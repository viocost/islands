#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <qsystemtrayicon.h>
#include "islandmanager.h"

namespace Ui {
class MainWindow;
}

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

private:
    Ui::MainWindow *ui;
    QSystemTrayIcon *mSystemTrayIcon;
    QAction *minimizeAction;
    QAction *quitAction;
    QAction *launchIslandAction;
    QAction *shudownIslandAction;
    QAction *restartIslandAction;
    QMenu *trayIconMenu;

    void updateIslandStatus();
};

#endif // MAINWINDOW_H
