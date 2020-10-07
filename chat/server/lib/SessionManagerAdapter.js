const CuteSet = require("cute-set");
const { log } = require("winston");
const { WildEmitter } = require("../../common/WildEmitter")
const { SessionAdapter } = require("./SessionAdapter")


class SessionManagerAdapter{
    constructor(accounts = []){
        WildEmitter.mixin(this)
        this._accounts = accounts;
    }

    //Given participant's pkfp returns active session if exists
    getSession(pkfp){
        return this.getSessionByTopicPkfp(pkfp);
    }

    getSessionByConnectionId(connectionId = Err.required()){
        for(let account of this._accounts){
            for(let session of account.sessions){
                if(session.getId() === connectionId){
                    return new SessionAdapter(account.sessions)
                }
            }
        }
    }

    //this should be vault id
    // The purpose of this is to give any random active session for given vault
    getSessionBySessionID(vaultId){
        console.log(`Attempt to find a session by vault id: ${vaultId}`);
        if(!vaultId){
            throw new Error("No vault id provided")
        }
        let account = this._accounts.filter(acc=> acc.vault.getId() === vaultId)[0]
        if(account){
            return new SessionAdapter(account.sessions)
        }
    }

    getSessionByTopicPkfp(pkfp){
        for(let account of this._accounts){
            let topicIds = new CuteSet(account.vault.getTopicsIds())
            if(topicIds.has(pkfp)){
                return new SessionAdapter(account.sessions)
            }

        }
    }

    broadcastMessage(topicPkfp, message){
        let adapter = this.getSessionByTopicPkfp(topicPkfp);
        if(adapter){
            adapter.broadcast(message)
        } else {
            console.log(`Active session not found for ${topicPkfp}`);
        }

    }

}

module.exports = {
    SessionManagerAdapter: SessionManagerAdapter
}
