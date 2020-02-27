@echo off

Rem Parse CLI args, create directories
Rem Fetch binaries or build them

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