@echo off

Rem LINKS
Rem Python 32-bit https://www.python.org/ftp/python/3.7.6/python-3.7.6-embed-win32.zip
Rem Python 64-bit https://www.python.org/ftp/python/3.7.6/python-3.7.6-embed-amd64.zip
Rem Node 32-bit https://nodejs.org/dist/v12.16.1/node-v12.16.1-win-x86.zip
Rem Node 64-bit https://nodejs.org/dist/v12.16.1/node-v12.16.1-win-x64.zip 
Rem Tor 32-bit https://www.torproject.org/dist/torbrowser/9.0.5/tor-win32-0.4.2.6.zip 
Rem Tor 64-bit https://www.torproject.org/dist/torbrowser/9.0.5/tor-win64-0.4.2.6.zip 


Rem Parse CLI args, create directories
Rem Fetch binaries or build them

Rem Checking if 7z is available
7z 2>nul >nul
if %ERRORLEVEL% NEQ 0 (
    echo 7z has not been found. Make sure 7z is installed and added to path.
    exit /b %ERRORLEVEL%
) 


set installer_path=%cd%
set components="tpni"
set base_path=

setlocal EnableDelayedExpansion
:loop
if not "%1"=="" (
    if "%1"=="-p" (
        set base_path=%~dpnx2
        set nul_file=\nul
        set test_path=!base_path!!nul_file!

        if not exist !test_path! (
            echo Base path does not exist
            exit 1
        )
        echo Base path is !base_path!
        shift
        shift
    )

    if "%1"=="-c" (
        SET components=%2
        shift
        shift
    )
    goto :loop
)

echo Components = %components%
echo path = %base_path%

set build_path=!base_path!\islands
set win32_path=!build_path!\win32
set win64_path=!build_path!\win64

if not exist !build_path! (
    mkdir !build_path!
)


if not exist !win32_path! (
    mkdir !win32_path!
)


if not exist !win64_path! (
    mkdir !win64_path!
)

cd !build_path!
curl -O "https://www.python.org/ftp/python/3.7.6/python-3.7.6-embed-win32.zip" 


cd !installer_path!