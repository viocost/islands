import { WildEmitter } from "../../../../common/WildEmitter";

export class UIMessageBus{
    constructor(){
        WildEmitter.mixin(this);
    }
}
