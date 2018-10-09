#pragma once

#include <string>

class IslandManager{
    public:
        IslandManager();
        ~IslandManager();

        int launchIsland();
        int shutdownIsland();
        int checkStatus();

        int setDataDirectory();
        int setMainPort();

    private:
        std::string exec(std::string command);
};


