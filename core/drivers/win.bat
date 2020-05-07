@echo off

setlocal enabledelayedexpansion
rem Core binaries for easy access

set VERSION="1.0.0"

set BASE=%~dp0
reg Query "HKLM\Hardware\Description\System\CentralProcessor\0" | find /i "x86" > NUL && set OS=32BIT || set OS=64BIT
if %OS%==64BIT (
    set WINDIR=win64
) else (
    set WINDIR=win32
)
set NODEJS=!BASE!/core/!WINDIR!/node/node.exe


echo Starting up island...
!NODEJS! !APPS!/engine/engine.js


