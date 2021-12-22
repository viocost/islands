
// this class represents generic collection
// of arbitrary objects of the same type.
// It also implements convenient API for easier access
//
class ObjectCollection{
    constructor(keyExtractor, validator = (obj)=>true){
        if(!(typeof keyExtractor === "function")){
            throw new TypeError("Expecting key extractor function")
        }

        this.keyExtractor = keyExtractor
        this._collection = new Map()
        this.validate = validator

        this[Symbol.iterator] = function * (){
            for(let id of this._collection.keys()){
                yield this._collection.get(id);
            }
        }
    }

    add(obj){
        let id = this.keyExtractor(obj)
        if(this.validate(obj)){
            this._collection.set(id, obj)
        }
    }

    delete(id){
        if(this.validate(id)){
            id = this.keyExtractor(id)
        }
        this._collection.delete(id)
    }

    get(id){
        return this._collection.get(id)
    }

    has(id){
        if(this.validate(id)){
            id = this.keyExtractor(id)
        }
        return this._collection.has(id)
    }

    get length(){
        return this._collection.size
    }

    deleteAll(){
        this._collection.clear()
    }
}

module.exports = {
    ObjectCollection: ObjectCollection

}
