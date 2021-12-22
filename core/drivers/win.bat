@echo off

setlocal enabledelayedexpansion
rem Core binaries for easy access

set VERSION="1.0.0"

set BASE=%~dp0
set WINDIR=win64

set NODEJS=!BASE!\core\!WINDIR!\node\node.exe
set APPS=!BASE!\apps

echo Starting up island...
!NODEJS! !APPS!\engine\engine.js %*
