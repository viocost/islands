export class TopicUXData{
    unreadMessagesCount=0;
    isInitialized=false;
    messagesLoaded=0
    earliestLoadedMessage=null
    latestLoadedMessage=null
    participants=new Set();

    constructor(){
        this.messagesLoadedIds = new Set();
    }
}
