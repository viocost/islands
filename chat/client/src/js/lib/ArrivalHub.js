import { WildEmitter } from "./WildEmitter";

export class ArrivalHub{
    constructor(connector){
        WildEmitter.mixin(this);
        this.connector = connector;

        //on every message find topic id in header and emit with topic id
        // or emit to vault
        //
    }

}
