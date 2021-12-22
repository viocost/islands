//All messages will inherit from MessageBase
//This class is re-generated every time codegen runs

class MessageBase{

    constructor(name){
        //name maybe used later
    }

    serialize(){
        return JSON.stringify(this)
    }

    enclose(){
        return {
            messageName: this.getName(),
            body: this.serialize()
        }
    }

    getName(){
        //not implemented
    }
}
