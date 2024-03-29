import { WildEmitter } from "./WildEmitter";
import { SessionEvents } from "../../../../common/Session"
import { inspect } from "util";


export class ArrivalHub{
    constructor(session){
        WildEmitter.mixin(this);
        this.session = session;

        //on every message find topic id in header and emit with topic id
        // or emit to vault
        //
        this.session.on(SessionEvents.MESSAGE, data=>{
            console.log(`Arrival hub received message from session.`);

            //connector already got it

            if (data && data.headers){
                let dest = data.headers.pkfpDest || data.headers.pkfpSource;

                if (!dest){
                    console.warn(`Unknown destination packet received: Event: ${event}, Data: ${inspect(data)}`);
                } else {

                    console.log(`Destination: ${dest}`);
                    this.emit(dest, data);

                }
            } else {
                console.log(`MESSAGE WITHOUT HEADERS ARRIVED. Event: ${event}, data: ${inspect(data)}, `);
            }
        })

    }

}
