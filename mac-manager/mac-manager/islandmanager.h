#pragma once

#include <string>
#include "config.h"

class IslandManager{
    public:
        IslandManager();
        ~IslandManager();
        int launchIsland();
        int shutdownIsland();
        int restartIsland();
        bool isIslandRunning();
        int setDataDirectory();
        int setMainPort();
        void init_config();

        //getters
        std::string get_vbox_path();
        std::string get_vmname();

        //setters
        void set_vbox_path(std::string path);
        void set_vname(std::string name);

    private:
        Config * config;

        const std::string CMD_RESPONSE_FILE = "response.tmp";
        IslandManager(IslandManager const&) = delete;
        IslandManager& operator= (IslandManager const&) = delete;
        int exec(std::string command);
};


