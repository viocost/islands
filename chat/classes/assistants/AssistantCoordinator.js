const EventEmitter = require("events").EventEmitter;

class AssistantCoordinator{
    constructor(){
        throw "Assistant coordinator cannot be initialized directly."
    }
    static initialize(){
        AssistantCoordinator._notifier = new EventEmitter();
    }
    static notify(ev, data){
        AssistantCoordinator._notifier.emit(ev, data);
    }

    static on(ev, handler){
        AssistantCoordinator._notifier.on(ev, handler);
    }
}

module.exports = AssistantCoordinator;