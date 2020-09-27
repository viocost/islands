# Build process

## Building core
Islands works natively on Windows, MacOS and Linux.
This achieved by compiling required binaries in every operating system.

There are 3 builder scripts:
- core/linux-build.sh
- core/mac-build.sh
- core/win-build.bat

Run each of them with parameter  -p specifies destination directory (previously created)
There are also optional parameters. Run script with -h flag to learn more.

Script will produce islands/<os_name> directory and islands/<os_name>.zip
file, which contains <os_name> directory compressed.

## Building Islands


## Main build script 
Once all necessary binaries are compiled and available - run main build script: 

- core/make-islands.sh

It takes following parameters:

-p specifies destination directory (previously created)
-w path to windows.zip (optional)
-m path to mac.zip (optional)
-l path to linux.zip (optional)
-v core version. Creates core version file in Islands root directory (optional)

Once the script finished its work - the islands now should work.


