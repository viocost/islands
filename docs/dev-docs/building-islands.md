# Build process
## Requirements
- It is recommended to run main build script under Linux
it is certainly possible to run it in other OSes, but hasn't been tested.
Additional dependencies may be required.

- Node.js version 12 or higher and npm are required to run main build script


## Building core
Islands works natively on Windows, MacOS and Linux.
This achieved by compiling required binaries in every operating system.

There are 3 builder scripts in <git checkout>/core/:
- linux-build.sh
- mac-build.sh
- win-build.bat

Run each of them with parameter  -p <dest> specifies destination directory. 
If destination directory doesn't exist, script will attempt to create it. 
NOTE! Make sure you are in <git checkout>/core directory before running a script.
There are also optional parameters. Run script with -h flag to learn more.

Script will produce <dest>/islands/<os_name> directory and <dest>/islands/<os_name>.zip
file, which contains <os_name> directory compressed.


## Main build script 
Once all necessary binaries are compiled and available - run main build script: 
`core/make-islands.sh` 

It takes following parameters:
-d Builds islands with all dev packages
-p specifies destination directory (previously created)
-w path to windows.zip (optional)
-m path to mac.zip (optional)
-l path to linux.zip (optional)
-v core version. Creates core version file in Islands root directory (optional)

The script will unzip supplied binaries, rebuild islands backend and 
bundles it all together at specified destination directory.

Once the script has finished its work - the islands should now be functional.


## Building Islands 
### Backend
To build backend from /islands/chat directory run either
`npm run build` - production
`npm run build-dev` - development

to clean, run:
`npm run unbuild`

### Frontend
- To rebuild frontend run 
`npm run build-front`
Note, that dev packages must be installed. If not - run `npm run build-dev` first

## Running islands
There are 3 scripts to run islands under various OSes:
- mac.sh
- linux.sh
- win.bat

Run islands by running one of them.

They take following parameters:

-u islands_update_x.x.xxx.zip
    Update islands with update file and exit

-p
    Chat port. Default port is ephemeral.

-d
    Debug mode.

--tor-password somepassword
    When running in debug mode - set specific tor password
    This will not work in production mode.

-v
    Print version and exit
-h
    Print help message

## Development 
Main islands chat application meant to work only within the environment initialized by core
engine, as a part of build. Thus trying to run the chat from the cloned
directory will work.

To setup Islands for development follow this steps: 

1. Clone islands source
2. Build dev version of Islands to separate directory, follow "Building core",
   "Building Islands", "Main build script". 

3. Start built islands in dev mode (follow "Running islands" instructions)
4. Work on the source code in the _cloned repo_, not inside the build!

5. Run refresh script from _cloned repo_ and provide it a path to islands build.
In debug mode engine will automatically restart the app, once app files are
replaced.


Refresh script is `refresh.sh` under chat directory inside the clonned repo. 
It rebuilds islands replaces the source files inside the existing build. 
It can be ran manually with optional -bf flag that will also rebuild the frontend.
Refresh script must be given a path to islands build, specifically it should be a
path to root islands directory where startup scripts (linux.sh, mac.sh, win.bat)
are located. The path doesn't have to be absolute.


It is also possible to automate running refresh scripts with entr, and there are 
2 scripts in chat directory: `watcher.sh` and `watcher-client.sh`
provide both scripts a path to islands and once source code is changed - entr 
will automatically replace the source code in islands.

watcher.sh watches backend files, watcher-client.sh watches front-end and common files.

Make sure entr is installed.

NOTE! Refresh script only replaces chat source. If you modify the engine or any
files outside of chat directory - they will not be applied to build
automatically. You need to either rebuild the core, or copy files manually

Problems: 
- entr doesn't watch for new files being created and will
not react, thus, when you add new files - restart the watcher script.

- entr will die if watched file is deleted or moved.

### Project structure

islands 
  /chat 
     /client - frontend source
     /old_server - backend libraries that are going to be replaced eventually.
     /server - backend
     /common - common libraries
     /test - mocha/chai unit tests
     /custom-test - custom tests that don't fit mocha/chai model
     /public - static files directory

  /core - core source files
  




