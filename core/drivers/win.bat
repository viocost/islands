@echo off

setlocal enabledelayedexpansion
rem Core binaries for easy access

set BASE=%~dp0
reg Query "HKLM\Hardware\Description\System\CentralProcessor\0" | find /i "x86" > NUL && set OS=32BIT || set OS=64BIT
if %OS%==64BIT (
    set WINDIR=win64
) else (
    set WINDIR=win32
)
set NODEJS=!BASE!/core/!WINDIR!/node/node.exe
set PYTHON=!BASE!/core/!WINDIR!/python/python.exe
set TOR=!BASE!/core/!WINDIR!/tor/tor.exe

rem Data dir
set ISLANDS_DATA=!BASE!/data

rem Apps dir
set APPS=!BASE!/apps

rem Config dir
set CONFIG=!BASE!/config

echo Starting up island...
!NODEJS! !APPS!/engine/engine.js


