@echo off
setlocal EnableDelayedExpansion

Rem LINKS
Rem Python 32-bit https://www.python.org/ftp/python/3.7.6/python-3.7.6-embed-win32.zip
Rem Python 64-bit https://www.python.org/ftp/python/3.7.6/python-3.7.6-embed-amd64.zip
Rem Node 32-bit https://nodejs.org/dist/v12.20.1/node-v12.20.1-win-x86.zip
Rem Node 64-bit https://nodejs.org/dist/v12.20.1/node-v12.20.1-win-x64.zip
Rem Tor 32-bit https://www.torproject.org/dist/torbrowser/9.0.5/tor-win32-0.4.4.6.zip
Rem Tor 64-bit https://www.torproject.org/dist/torbrowser/9.0.5/tor-win64-0.4.4.6.zip


set torfile=tor-win64-0.4.4.6.zip
set torurl=https://dist.torproject.org/torbrowser/10.0.9/

set nodeurl=https://nodejs.org/dist/v12.20.1/
set nodefile=node-v12.20.1-win-x64.zip
set nodedir=node-v12.20.1-win-x64



Rem Parse CLI args, create directories
Rem Fetch binaries or build them

Rem Checking if 7z is available

call :check_permissions
if %ERRORLEVEL% NEQ 0 (
    exit /b %ERRORLEVEL%
)


rem checking if 7z is installed

if exist %programfiles%\7-zip (
    set path=!path!;%programfiles%\7-zip
) else (
    if exist %programfiles%\7-zip (
        set path=!path!;%programfiles(x86)%\7-zip
    )
)


7z 2>nul >nul

if %ERRORLEVEL% NEQ 0 (
    rem 7z not installed. Die.
    echo "7z has not been found. Make sure 7z is installed."
    exit /b %ERRORLEVEL%
)

rem Preparations

echo  "Path %path%"
echo Normalizing
call :normalize_path "%~dp0\.."
echo done
set bin_path=!NORMAL_PATH!\bin
set apps_path=!NORMAL_PATH!\bin\apps
set core_path=!bin_path!\core\win64

echo "Bin path: !bin_path!"
echo "Core path: !core_path!"

if  exist "!bin_path!" (
    rd /S /Q "!bin_path!"
)

echo  creating build dir
mkdir  !core_path!


call :install_node
call :install_tor

call :install_sqlite


echo "Path set to: !path!"

call :reset_dir !apps_path!

call :build_chat

call :build_engine
call :generate_config
call :copy_launchers
call :install_all

goto :EOF

set installer_path=%cd%
set components="tpni"
set base_path=

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
set win64_path=!build_path!\win64

if not exist !build_path! (
    mkdir !build_path!
)



if not exist !win64_path! (
    mkdir !win64_path!
)

rem =================== MAIN INSTALL FUNCTIONS CALLS

cd !build_path!
echo installing node
call :install_node

echo installing tor
call :install_tor

echo packing binaries...
cd !build_path!
7z a windows.zip -r win32 win64 -tzip

cd !installer_path!

exit /b %ERRORLEVEL%

rem =================== END MAIN INSTALL FUNCTIONS CALLS

:install_node
  set nodejs64_path=!core_path!\node

  if  exist !nodejs64_path! (
      rd /S /Q !nodejs64_path!
  )

  rem mkdir !nodejs32_path! !nodejs64_path!
  cd !core_path!

  call curl -L -O "!nodeurl!!nodefile!"

  call 7z x !nodefile!
  timeout 1
  move !nodedir! !core_path!\node

  rem Cleanup
  del /F /Q !nodefile!
  set path=!PATH!;!core_path!\node
EXIT /B 0

:install_tor

  echo "Core path %core_path%"

  set tor64_path=%core_path%\tor

  if  exist %tor64_path% (
      rd /S /Q %tor64_path%
  )

  rem mkdir !tor32_path! !tor64_path!

  call curl -L -O "!torurl!!torfile!"

  call 7z x  !torfile!
  timeout 1
  move Tor %tor64_path%
  rd Data /Q /S

  rem Cleanup
  del /F /Q !torfile!

EXIT /B 0

:install_sqlite
  @echo on
  call npm i -g --production windows-build-tools --vs2015
  call npm i -g better-sqlite3
  @echo off
EXIT /B 0

:build_chat
  set js_path=!normal_path!\chat
  cd  !js_path!

  rem Making sure no node modules installed
  if exist "!js_path!\node_modules" (
      rd /S /Q "!js_path!\node_modules"
  )

  @echo on
  call npm run build
  call npm run build-front
  call npm prune --production
  @echo off
  call reset_dir !apps_path!\chat
  xcopy /i /e /k /h !js_path! !apps_path!\chat
EXIT /B 0

:build_engine
  set engine_path=!normal_path!\core\services\engine
  cd !engine_path!
  call npm run build
  call reset_dir !apps_path!\engine
  xcopy /i /e /k /h !engine_path! !apps_path!\engine
  cd !normal_path!
EXIT /B 0

:copy_launchers
  xcopy !normal_path!\core\drivers\* !normal_path!\bin
EXIT /B 0

:generate_config
   set config_path=!normal_path!\bin\config
   call :reset_dir !config_path!
   call node !normal_path!\core\config-gen\generate -p !config_path!
EXIT /B 0

:install_all
   set dist_path=!normal_path!\dist
   set install_path=!normal_path!\dist\islands
   call :reset_dir !dist_path!
   mkdir !install_path!
   mkdir !install_path!\data
   xcopy /e /k /h /i !normal_path!\bin\apps !install_path!\apps
   xcopy /e /k /h /i !normal_path!\bin\core !install_path!\core
   xcopy /e /k /h /i !normal_path!\bin\config !install_path!\config
   xcopy !normal_path!\core\drivers\* !install_path!
EXIT /B 0


:normalize_path
  set "NORMAL_PATH=%~f1"
EXIT /B 0

rem Deletes directory if it already exists and creates new one
:reset_dir
   if  exist %~1 (
       rd /S /Q %~1
   )
   mkdir %~1
EXIT /B 0


:check_permissions
    echo Administrative permissions required. Detecting permissions...

    net session >nul 2>&1
    if %errorLevel% == 0 (
        echo Success: Administrative permissions confirmed.
        exit /B 0
    ) else (
        echo Failure: Administrative permissions are required.
        exit /B %errorLevel%
    )
exit /B 0
