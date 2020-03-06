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
set PYTHON=${BASE}/core/!WINDIR!/python/python.exe
set TOR=${BASE}/core/!WINDIR!/tor/tor.exe

# Data dir
set ISLANDS_DATA=!BASE!/data

# Apps dir
set APPS=!BASE!/apps

# Config dir
set CONFIG=!BASE!/config

# Tor dynamic password
set "string=abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
set TOR_PASSWD=
for /L %%i in (1,1,16) do call :add

%TOR% --hash-password !TOR_PASSWD! > %BASE%/tmphash
set /p TOR_PASSWD_HASH= < %BASE%/tmphash
del %BASE%/tmphash

echo Starting up island...
${NODEJS} ${APPS}/engine/engine.js


goto :eof

:add
set /a x=%random% %% 62
set TOR_PASSWD=%TOR_PASSWD%!string:~%x%,1!
goto :eof
