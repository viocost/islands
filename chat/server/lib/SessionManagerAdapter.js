const { CuteSet } = require("cute-set")
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
        let account = this._accounts.filter(acc=> account.vault.getId() === vaultId)[0]
        if(account){
            return new SessionAdapter(account.sessions.getActive())
        }
    }

    getSessionByTopicPkfp(pkfp){
        for(let account of this._accounts){
            let topicIds = new CuteSet(account.vault.getTopicIds())
            if(topicIds.has(pkfp)){
                return new SessionAdapter(account.sessions)
            }

        }
    }

    broadcastMessage(vaultId, message){
        let adapter = this.getSessionBySessionID(vaultId);
        if(adapter){
            adapter.broadcast(message)
        }
    }

}

module.exports = {
    SessionManagerAdapter: SessionManagerAdapter
}
