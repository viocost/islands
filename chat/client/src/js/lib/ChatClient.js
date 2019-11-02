import { WildEmitter } from "./WildEmitter";
import { ChatEvent } from "./ChatEvent";
import { Vault } from "./Vault"
import { XHR } from "./xhr";
import { Connector } from "./Connector";
import { MessageQueue } from  "./MessageQueue";
import { ArrivalHub } from "./ArrivalHub";

export class ChatClient{
    constructor(opts){
        WildEmitter.mixin(this);
        if(!opts.version){
            throw new Error("Version required!");
        }
        this.version = opts.version;
        this.vault;
        this.topics;
        this.messageQueue;
        this.connector;
        this.arrivalHub;
    }



    //Logs in and initializes session
    initSession(password){
        setImmediate(async ()=>{
            try{
                if (!password){
                    throw new Error("Password is missing.")
                }
                console.log("Initializing session");
                let response = await this.getVault();
                if (!response.vault){
                    throw new Error("Vault not found")
                }
                let vault = response.vault;
                console.log("Got vault");
                //Initialize vault
                this.vault = new Vault()
                this.vault.initSaved(vault, password)
                console.log("Vault initialized. Initializing connector...");

                //Initialize multiplexor socket
                this.connector = new Connector();
                await this.connector.establishConnection();
                console.log("Connection established. Initializing arrival hub..");
                this.arrivalHub = new ArrivalHub(this.connector);


                //Initialize message queue

                this.messageQueue = new MessageQueue(this.connector);

                //Initialize topic instances
                this.emit(ChatEvent.LOGIN_SUCCESS)
            } catch (err){
                this.emit(ChatEvent.LOGIN_ERROR, err);
                console.trace(err)
            }
        })
    }


    shout(msg){
        this.messageQueue.enqueue(msg)
    }

    whisper(msg){
        this.messageQueue.enqueue(msg)
    }



    async _vaultLogin(vaultData, password){
    }


    async _initMessageQueue(){
        this.messageQueue = new MessageQueue();
    }

    // ---------------------------------------------------------------------------------------------------------------------------
    // HELPERS

    //requests vault and returns it
    getVault(){
        return new Promise((resolve, reject)=>{
            XHR({
                type: "post",
                url: "/",
                success: (data)=>{
                    console.log("Vault obtained. Processing...");
                    try{
                        resolve(data)
                    }catch(err){
                        reject(err);
                    }
                },
                error: err => {
                    reject(err);
                }
            })
        })
    }


}
