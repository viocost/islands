#pragma once

#include <string>

class IslandManager{
    public:
        static void initialize();
        static IslandManager& getInstance();
        int launchIsland();
        int shutdownIsland();
        int checkStatus();

        int setDataDirectory();
        int setMainPort();

    private:
        IslandManager();
        ~IslandManager();

        IslandManager(IslandManager const&) = delete;
        IslandManager& operator= (IslandManager const&) = delete;

        std::string exec(std::string command);
};


