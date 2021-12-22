import * as err from "../../../../common/Error";

class BaseContainer{
    constructor(DOMnode){
        if(this.constructor === BaseContainer){
            throw new err.AttemptToInstatiateBaseClass();
        }
        this._node = DOMnode

    }

    clearContainer(){
        throw new err.NotImplemented()
    }

    setContent(){
        throw new err.NotImplemented()
    }

}

export class DOMContainer extends BaseContainer{

    clearContainer(){
        this._node.innerHTML = ""
    }

    setContent(node){
        this.clearContainer()
        this._node.appendChild(node)
    }
}
