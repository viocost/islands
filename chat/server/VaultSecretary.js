const { Message  } = require('../common/Message')
/**
 * Routes messags from related vault to client in a standard envelope
 */
class VaultSecretary{

    constructor(vaultId, sessions){
        this.sessions = sessions;
        this.vaultId = vaultId
    }

    //Delivers message to all client sessions in standard envelope
    deliverAll(ev, data){

        //Creating standard client-island envelope
        let message = new Message(global.VERSION)
        message.setSource("island");
        message.setDest(this.vaultId);
        message.setCommand(ev)
        message.setBody(data)

        //Delivering to all sessions
        for (let session of this.sessions){
            session.acceptMessage(message);
        }
    }

}


module.exports = {
    VaultSecretary: VaultSecretary
}
