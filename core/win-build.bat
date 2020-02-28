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

rem =================== MAIN INSTALL FUNCTIONS CALLS

cd !build_path!
echo installing node
call :install_node

echo installing python
call :install_python

echo installing tor
call :install_tor

echo packing binaries...
cd !build_path!
7z a windows.zip -r win32 win64 -tzip

cd !installer_path!

exit /b %ERRORLEVEL%

rem =================== END MAIN INSTALL FUNCTIONS CALLS

:install_python
  SETLOCAL
  set python32_path=!win32_path!\python
  set python64_path=!win64_path!\python

  if exist !python32_path! (
      rd /S /Q  !python32_path!
  )
  
  if  exist !python64_path! (
      rd /S /Q !python64_path!
  )

  mkdir !python32_path! !python64_path!

  curl -L -O "https://www.python.org/ftp/python/3.7.6/python-3.7.6-embed-win32.zip" 
  curl -L -O "https://www.python.org/ftp/python/3.7.6/python-3.7.6-embed-amd64.zip"
  7z x python-3.7.6-embed-win32.zip -O%python32_path%
  7z x python-3.7.6-embed-amd64.zip -O%python64_path%

  rem Cleanup
  del /F /Q python-3.7.6-embed-win32.zip 
  del /F /Q python-3.7.6-embed-amd64.zip 

  ENDLOCAL

EXIT /B 0

:install_node

  SETLOCAL
  set nodejs32_path=!win32_path!\node
  set nodejs64_path=!win64_path!\node

  if exist !nodejs32_path! (
      rd /S /Q  !nodejs32_path!
  )
  
  if  exist !nodejs64_path! (
      rd /S /Q !nodejs64_path!
  )

  rem mkdir !nodejs32_path! !nodejs64_path!

  curl -L -O  "https://nodejs.org/dist/v12.16.1/node-v12.16.1-win-x86.zip"  
  curl -L -O  "https://nodejs.org/dist/v12.16.1/node-v12.16.1-win-x64.zip"

  7z x node-v12.16.1-win-x86.zip 
  timeout 1
  move node-v12.16.1-win-x86 !nodejs32_path!

  7z x node-v12.16.1-win-x64.zip 
  timeout 1
  move node-v12.16.1-win-x64 !nodejs64_path!

  rem Cleanup
  del /F /Q node-v12.16.1-win-x86.zip  
  del /F /Q node-v12.16.1-win-x64.zip  

  ENDLOCAL
EXIT /B 0



:install_tor

  SETLOCAL
  set tor32_path=!win32_path!\tor
  set tor64_path=!win64_path!\tor

  if exist !tor32_path! (
      rd /S /Q  !tor32_path!
  )
  
  if  exist !tor64_path! (
      rd /S /Q !tor64_path!
  )

  rem mkdir !tor32_path! !tor64_path!

  curl -L -O "https://www.torproject.org/dist/torbrowser/9.0.5/tor-win32-0.4.2.6.zip"
  curl -L -O "https://www.torproject.org/dist/torbrowser/9.0.5/tor-win64-0.4.2.6.zip" 

    

  7z x  tor-win32-0.4.2.6.zip  
  timeout 1
  move Tor !tor32_path!
  rd Data /Q /S

  7z x  tor-win64-0.4.2.6.zip  
  timeout 1
  move Tor !tor64_path!
  rd Data /Q /S

  rem Cleanup
  del /F /Q tor-win32-0.4.2.6.zip
  del /F /Q tor-win64-0.4.2.6.zip

  ENDLOCAL
EXIT /B 0
