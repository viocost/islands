const iCrypto = require("../libs/iCrypto.js");
const Internal = require("../../../common/Events").Internal;
const Err = require("../libs/IError.js");
const SESSION_ID_LENGTH = 7;
const CuteSet = require("cute-set");
const EventEmitter = require("events");

const Logger = require("../libs/Logger.js");

/**
 * Session is an object that represents act of communication between client and server.
 * Client is identified by vault ID.
 *
 * Session object holds temporary session key that is used to sign and ecnrypt data between client and server.
 * The key is generated every time when session is created, or when key time expires.
 *
 * Session object keeps track of all active sockets that related to the vault, as well as all topic pkfps.
 * When last socket is disconnected - session still remains active until client reconnects or time is up.
 * Default timeout is set to 4 minutes. After that session object is destroyed.
 * 
 */
class ClientSession extends EventEmitter{

    constructor(vaultId = Err.required("Missing required parameter clientPkfp"),
                connectionId = Err.required("Missing required parameter socketId"),
                connectionManager = Err.required("Missing connection manager")) {
        super();
        this.pending = true;
        this.connectionManager = connectionManager;
        this.timeInitialized = Date.now();
        this.timeInactive = null;
        this.id = vaultId;
        this.connections = new CuteSet([connectionId]);
        this.topics = new CuteSet();
        this.publicKey;
        this.privateKey;
        this.pkfp;
        setTimeout(()=>{
            this.initKey(this)
        }, 100);
    }

    initKey(self){
        Logger.debug("Initializing keys", {cat: "session"});
        let ic = new iCrypto();
        ic.rsa.createKeyPair("kp")
          .getPublicKeyFingerprint("kp", "pkfp")
        self.pkfp = ic.get("pkfp");
        self.publicKey = ic.get("kp").publicKey;
        self.privateKey = ic.get("kp").privateKey;
        self.pending = false;
        Logger.debug("Session key has been generated!", {cat: "session"})
    }

    getPublicKey(){
        let self = this;
        return new Promise((resolve, reject)=>{
            let timeout = 10000;
            let start = new Date();

            let tick = ()=>{
                if (self.pending){
                    if (new Date() - start > timeout){
                        reject(new Error(`Timeout getting session public key. Session is still pending. Key vaule: ${self.publicKey}`))
                        return;
                    }
                    setTimeout(tick, 500);
                } else {
                    resolve(this.publicKey)
                }
            }
            tick();
        })
    }


    hasConnection(connectionId){
        return this.connections.has(connectionId);
    }

    addConnection(connectionId){
        Logger.debug(`Adding connection ${connectionId} to session ${this.id}`, {cat: "session"})
        this.connections.add(connectionId);
        this.timeInactive = null;
    }

    removeConnection(connectionId){
        Logger.debug(`Removing connection ${connectionId} from session ${this.id}`, {cat: "session"})
        this.connections.remove(connectionId);
        if(!this.isActive()){
            Logger.debug("Session is now inactive. Setting self-desdtruction timer", {cat: "session"})
            this.timeInactive = new Date();
            this.startSelfDestructionTimer();
        }
    }

    isActive(){
        this.cleanZombies()
        return this.connections.length > 0;
    }


    startSelfDestructionTimer(){

        Logger.debug("Self destruction timer started", {cat: "session"})
        let self = this;
        let timeout = 240000; //timeout for 4 minutes
        let tick = ()=>{
            if (self.timeInactive === null){
                Logger.debug("Session is active again. Stopping timer...", {cat: "session"})
                return;
            }
            if (new Date() - self.timeInactive >= timeout){
                Logger.debug("Timeout reached. Destructing...", {cat: "session"})
                self.emit(Internal.KILL_SESSION, this);
            } else {
                setTimeout(tick, 2000);
            }
        }
        setImmediate(tick);
    }

    // ---------------------------------------------------------------------------------------------------------------------------
    // Goes over active connections and checks whether they alive. If not - removes them.
    cleanZombies(){
        let zombies = new CuteSet();
        for(let conn of this.connections){
            if (!this.connectionManager.isAlive(conn)){
                zombies.add(conn);
            }
        }
        if (zombies.length > 0){
            Logger.debug(`Found zombie connecions: ${JSON.stringify(zombies.toArray())}`, {cat: "connection"});
            this.connections = this.connections.minus(zombies);
        }
    }


}

module.exports = ClientSession;
