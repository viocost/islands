const Lock = require("./Lock.js");
const Logger = require("./Logger.js");
const fs = require('fs-extra');
const Err = require("./IError.js");
const Set = require("cute-set");
const Semver = require("semver") // version parser

/**
 * Collection of CounterSet instances
 *
 */
class CounterSetCollection{

    constructor(historyManager){
        this._counterSets = {};
        this.historyManager = historyManager;
        let historyIds = this.historyManager.getAllhistoryIDs()

        Logger.debug("Initializing counters for each topic ID")

        for(let key of historyIds){
            this._counterSets[key] = new CounterSet(key, historyManager);
        }

        Logger.debug("Message counters has been initialized successfully")
    }

    async initialize(){

    }

    initCounterSet(pkfp){
        if (this._counterSets.hasOwnProperty(pkfp)){
            throw "Error initializing counter set: already exists";
        }

        this._counterSets[pkfp] = new CounterSet(pkfp, this.historyManager);
    }

    get(pkfp){
        Logger.debug("Getting counter set")
        if (!this._counterSets.hasOwnProperty(pkfp)){
            throw `Counter set ${pkfp} not found!`;
        }
        return this._counterSets[pkfp];
    }
}


///////////////////////////////////////////////////////////////////////////////
//                 Set of message counters for a single user                 //
///////////////////////////////////////////////////////////////////////////////
class CounterSet{

    //Initialization of counters
    static async init(pkfp=Err.required(),
                      historyManager=Err.required()){
        const cs = new CounterSet(pkfp, historyManager);
        await cs._init();
    }

    // Only basic setup
    constructor(pkfp=Err.required(),
                historyManager=Err.required()){
        Logger.debug(`Initializing counter set for ${pkfp}`)
        this.pkfp = pkfp;
        this.lock = new Lock();
        this.hm = historyManager;
        this.path = historyManager.getPath(pkfp, "counters")
        Logger.debug(`Counter path: ${this.path}`)
        this._outgoing = {};
        this._incoming = {};


    }

    //Init helper
    async _init(){

        // get last metadata
        let metadata = JSON.parse(await this.hm.getLastMetadata(this.pkfp));
        let membersKeys = Object.keys(metadata.participants);


        //search for counters file
        if (!fs.existsSync(this.path)){
            this.initializeCounters(metadata)
        }

        //
        //if not found:
        //    create new counters
        //    initialize counters by analyzing history
        //else:
        //    load counters file
        //     verify counters keys match current participants
        //
        //init locks for each key
    }

    //Dump all counters in the file
    async _save(){

    }

    async initializeCounters(metadata){

        let keys = Object.keys(metadata.participants);

        let outgoing = {
            public: 0
        }

        let incoming = {}

        for (let key of keys){
            outgoing[key] = 0;
            incoming[key] = {
                public: 0,
                private: 0
            }
        }

        let setOfKeys = new Set(keys);

        //--------------------------------------------------------------
        // Counter processing loop
        let lastMessageID = undefined;
        while(1){
            let messages, keys, allLoaded = await this.hm.loadMoreMessages(this.pkfp, lastMessageID, numberOfMessages = 200);
            for (let msg of messages){
                let parsed = JSON.parse(msg);
                if(!Semver.valid(parsed.header.version)  || Semver.lt(parsed.header.version, "1.0.3")){
                    Logger.debug(`Message version is either old or invalid: ${version}.`)
                    continue;
                }

                if (parsed.header.author === this.pkfp){
                    //outgoing

                    if (parsed.header.private && setOfKeys.has(parsed.header.recipient)){
                        //private
                        let recipient = parsed.header.recipient;
                        outgoing[recipient] = Math.max(parsed.header.seq, outgoing[recipient])

                    } else {
                        //public
                        outgoing.public = Math.max(outgoing.public, parsed.header.seq);
                    }
                } else {
                    //incoming
                    let author = parsed.header.author;
                    if (!setOfKeys.has(author)) continue;

                    if (parsed.header.private){
                        //private
                        incoming[author].private = Math.max(incoming[author].private, parsed.header.seq);

                    } else {
                        //public
                        incoming[author].public = Math.max(incoming[author].public, parsed.header.seq);
                    }
                }
            }
            //updating last message id
            if (allLoaded)
                break
            else
                lasteMessageID = JSON.parse(messages[0]).header.id

        }

        console.log(`Counter initialization completed. \nOutgoing:
            ${JSON.stringify(outgoing)}\nIncoming: ${JSON.stringify(incoming)}`)
        this._outgonig = outgoing;
        this._incoming = incoming;
    }


    //updates and saves described counter
    async update(newVal, direction, type, otherPkfp){

    }

    getCounterValue(direction, type, otherPkfp){

    }


}


const CounterDirection = {
    OUTGOING: 0,
    INCOMING: 1
}

const CounterType = {
    PUBLIC: 0,
    PRIVATE: 1
}

module.exports.CounterSetCollection = CounterSetCollection;
module.exports.CounterSet = CounterSet;
module.exports.CounterDirection = CounterDirection;
module.exports.CounterType = CounterType;
