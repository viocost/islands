const { CuteSet } = require("cute-set")

class SessionManagerAdapter{
    constructor(accounts){
        this._accounts = accounts;
    }

    //Given participant's pkfp returns active session if exists
    getSession(pkfp){
        return this.getSessionByTopicPkfp(pkfp);
    }

    getSessionByConnectionId(connectionId = Err.required()){
        for(let adapterId in this.sessionAdapters){
            if (this.sessionAdapters[adapterId].hasSession(connectionId)){
                return this.sessionAdapters[adapterId];
            }
        }
    }

    getSessionBySessionID(adapterId){
        return this.sessionAdapters[adapterId];
    }

    getSessionByTopicPkfp(pkfp){
        for(let account of this._accounts){
            let topicIds = new CuteSet(account.vault.getTopicIds())
            if(toipcIds.has(pkfp)){
                return account.sessions
            }

        }
        ////////////////////////////////////////////////////////////////////
        // for(let adapterId in this.sessionAdapters){                    //
        //     if (this.sessionAdapters[adapterId].doesServeTopic(pkfp)){ //
        //         return this.sessionAdapters[adapterId];                //
        //     }                                                          //
        // }                                                              //
        ////////////////////////////////////////////////////////////////////
    }



    broadcastMessage(vaultId, message){

    }

}
