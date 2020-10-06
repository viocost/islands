const TorControl = require('tor-control');
const SocksProxyAgent = require("socks5-http-client/lib/Agent");
const ioClient = require('socket.io-client');
const { createDerivedErrorClasses  } = require("../../../common/DynamicError");
const { iCrypto } = require("../../../common/iCrypto")


let socksProxyHost = "127.0.0.1";
let socksProxyPort = "9050";


class TorControllerError extends Error{ constructor(data){ super(data); this.name = "TorControllerError" } }

const err = createDerivedErrorClasses(TorControllerError, {
    noPort: "NewOnionPortNotSpecified",
    noHost: "NewOnionHostNotSpecified",
    noKey:  "LaunchOnionKeyNotSpecified"

})


class TorController extends TorControl{
    constructor({ host, port, password }){
        /**
         * Tor control class
         * @link https://gitweb.torproject.org/torspec.git/tree/control-spec.txt
         * @param {{}} [opts] - Options
         * @param {string} [opts.host="localhost"] - Host address to tor-control
         * @param {number} [opts.port=9051] - Port of tor-control
         * @param {string} [opts.password=""] - Host address to tor-control (default localhost)
         * @param {string} [opts.path] - Connect by path (alternative way to opts.host and opts.port)
         * @constructor
         */
        super({ host: host, port: port, password: password})
    }

    static generateRSA1024Onion(){
        let ic = new iCrypto()
        ic.generateRSAKeyPair('kp', 1024)
        const onion = iCrypto.onionAddressFromPrivateKey(ic.get("kp").privateKey)
        return { onion: onion, publicKey: ic.get("kp").publicKey, privateKey: ic.get("kp").privateKey }
    }

    async createAndLaunchNewOnion({ host, port, keyType = "ED25519-V3" }){
        if(!port)  throw new err.noPort()
        if(!host)  throw new err.noHost()
        let request = `ADD_ONION NEW:${keyType} Flags=detach Port=80,${host}:${port}`;
        return this._processOnionLaunchRequest(request)
    }

    async launchOnionWithKey({ host, port, key }){
        if(!port)  throw new err.noPort()
        if(!host)  throw new err.noHost()
        if(!host)  throw new err.noKey()
        let portFull = `Port=80,${host}:${port}`
        console.log(`PORT: ${portFull}`);
        let request = `ADD_ONION ${this._preprocessKey(key)} Flags=detach ${portFull}`;
        return this._processOnionLaunchRequest(request)
    }


    _preprocessKey(privateKey){
        console.log(`Preprocessing key: ${privateKey}`);
        if(/^ED25519-V3/.test(privateKey)) return privateKey

        let ic = new iCrypto()
        ic.setRSAKey("sk", privateKey, "private")
          .pemToBase64("sk", "res", "private")
        return `RSA1024:${ic.get("res")}`
    }

    _processOnionLaunchRequest(request){
        return new Promise((resolve, reject)=>{
            this.sendCommand(request, async (err, response)=>{
                if(err) {
                    console.log("Tor command error " + err);
                    reject(err);
                    return
                }

                response.messages = this.torMessagesToJSON(response.messages);
                console.log("Hidden service was launched. ID: " + response.messages.ServiceID);
                let serviceID = response.messages.ServiceID + ".onion";
                console.log(serviceID)
                resolve(response);
            })
        })

    }



    awaitPublication(service, privateKey, attempts = 10, timeout = 20000){
        return new Promise((resolve, reject)=>{
            console.log("Awaiting publication!");
            let attempt = 0;
            const agent = new SocksProxyAgent({
                socksHost: socksProxyHost,
                socksPort: socksProxyPort
            });
            let endpoint = this.getWSOnionConnectionString(service);

            const socket = ioClient(endpoint + '/chat', {
                autoConnect: false,
                agent: agent,
                forceNew: true,
                reconnection: false,

            });


            let attemptConnection = ()=>{
                console.log("Attempting to connect to hidden peer. Attempt: " + attempt);
                socket.open();
            };

            socket.on('connect', async () => {
                socket.close();
                console.log("Service is available!");
                resolve()
            });

            socket.on('connect_error', (err)=>{
                console.log("TOR connector: connection error: " + err);
                if(attempt < attempts){
                    attempt +=1;
                    setTimeout(()=>{
                        attemptConnection()
                    }, timeout)
                }else{
                    reject()
                }

            });
            attemptConnection();

        })
    }

    getWSOnionConnectionString(onion, wss = false){
        let onionPattern = /[a-z0-9]*\.onion/;
        let portPattern = /\:[0-9]{1,5}$/;
        if (!onion || !onion.match(onionPattern))
            throw new Error("getWSOnionConnectionString: Invalid onion address: " + onion);
        onion = onion.trim();
        return (wss ? "wss://" : "ws://") + onion.match(onionPattern)[0] +
            (onion.match(portPattern) ? onion.match(portPattern)[0] : "");

    }

    torMessagesToJSON(messages){
        let result = {};
        for (let i=0; i<messages.length; ++i){
            let delimiterIndex = messages[i].indexOf('=');
            let key = messages[i].substring(0, delimiterIndex);
            let value = messages[i].substr(delimiterIndex +1);
            if(delimiterIndex !== -1)
                result[key] = value;
        }
        return result;
    }

    async killHiddenService(serviceID){
        let idPattern = /^[a-z2-7]{16}(\.onion)?$/
        serviceID = serviceID.trim().substring(0, 16);
        if(!idPattern.test(serviceID)){
            throw new Error("Invalid service ID");
        }

        let request = "DEL_ONION " + serviceID;

        this.sendCommand(request, (err, response)=>{
            if(err){
                throw new Error(err)
            }
            return response
        })
    }


    listHiddenServices(detached = true){
        return new Promise((resolve, reject)=>{

            let request = "GETINFO " + (detached ? "onions/detached" : "onions/current");

            this.sendCommand(request, (err, response)=>{
                if(err)
                    reject(err);
                try {
                    resolve(response)
                }catch(err){
                    reject(err);
                }
            })
        })
    }

    isHSUp(hsid) {
        return new Promise((resolve, reject) => {
            this.listHiddenServices()
                .then(response=>{
                    let messages = response.messages;
                    hsid = new RegExp(hsid.substring(0, 16));
                    for (let i=0; i<messages.length; ++i){
                        //console.log("Testing " + hsid + " against " + messages[i]);
                        if(hsid.test(messages[i])){
                            console.log("Service "+messages[i] + " is already up!");
                            resolve(true);
                            return;
                        }
                    }
                    console.log("Service is not up");
                    resolve(false);
                })
                .catch(err =>{reject(err)})
        })
    }

    setEvents(events){
        let request = "SETEVENTS ";
        if (typeof(events)!=="object"){
            return this.sendCommandPromise(request + events)
        } else {
            for (let i=0; i<events.length; ++i){
                request += (events[i].trim() + " ")
            }
            return this.sendCommandPromise(request)
        }
    }

    removeAllEvents(){
        return this.sendCommandPromise("SETEVENTS")
    }


    sendCommandPromise(request, keepConnection){
        return new Promise((resolve, reject)=>{
            this.sendCommand(request, (err, response)=>{
                if(err)
                    reject(err);
                resolve(response)
            }, keepConnection)
        })
    }
}

module.exports = TorController;
