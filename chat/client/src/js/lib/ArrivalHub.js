import { WildEmitter } from "./WildEmitter";
import { inspect } from "util";

export class ArrivalHub{
    constructor(connector){
        let self = this
        WildEmitter.mixin(this);
        this.connector = connector;

        //on every message find topic id in header and emit with topic id
        // or emit to vault
        //
        this.connector.on("*", (event, data)=>{
            console.log(`Arrival hub received event from connector: ${event}`);

            //connector already got it
            if (event === "auth") return;


            if (data && data.headers){
                let dest = data.headers.pkfpDest || data.headers.pkfpSource;

                if (!dest){
                    console.warn(`Unknown destination packet received: Event: ${event}, Data: ${inspect(data)}`);
                    return;
                }
                self.emit(dest, data);
            } else {
                console.log(`MESSAGE WITHOUT HEADERS ARRIVED. Event: ${event}, data: ${JSON.stringify(data)}, `);
            }
        })

    }

}
