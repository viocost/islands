class Bipartite {
    constructor() {
        this._keys = {};
        this._vals = {};
    }

    static processInput(input) {
        if (!input) {
            throw "Empty input"
        } else if (typeof (input) === "object") {
            return JSON.stringify(input)
        } else {
            return input;
        }
    }

    push(k, v) {
        k = Bipartite.processInput(k);
        v = Bipartite.processInput(v);
        if (this._keys.hasOwnProperty(k)) {
            this._keys[k].add(v)
        } else {
            this._keys[k] = new Set([v]);
        }

        if (this._vals.hasOwnProperty(v)) {
            this._vals[v].add(k)
        } else {
            this._vals[v] = new Set([k]);
        }
    }

    addKey(k) {
        k = Bipartite.processInput(k);
        if (!this._keys.hasOwnProperty(k)) {
            this._keys[k] = new Set();
        }
    }

    addVal(v) {
        v = Bipartite.processInput(v);
        if (!this._vals.hasOwnProperty(v)) {
            this._vals[v] = new Set();
        }
    }

    delKey(k) {
        k = Bipartite.processInput(k);
        delete this._keys[k];
        Object.keys(this._vals).forEach(val => {
            this._vals[val].delete(k);
        })
    }

    delVal(v) {
        v = Bipartite.processInput(v);
        delete this._vals[v];
        Object.keys(this._keys).forEach(key => {
            this._keys[key].delete(v);
        })
    }

    key(k) {
        k = Bipartite.processInput(k);
        if(this._keys[k]){
            return Array.from(this._keys[k])
        }
    }

    val(v) {
        v = Bipartite.processInput(v);
        if(this._vals[v]){
            return Array.from(this._vals[v])
        }
    }


    hasKey(k){
        k = Bipartite.processInput(k);
        return this._keys.hasOwnProperty(k)
    }

    hasVal(v){
        v = Bipartite.processInput(k);
        return this._vals.hasOwnProperty(v)
    }

    keySize(){
        return Object.keys(this._keys).length
    }

    valSize(){
        return Object.keys(this._vals).length
    }

    getKeys(){
        return Object.keys(this._keys)
    }

    getVals(){
        return Object.keys(this._vals)
    }

    print(){
        return
        console.log("\nKEYS:")
        let keyString;
        Object.keys(this._keys).forEach(key=>{
            keyString = key + " => [";
            for (let val of this.key(key)){
                keyString += val +", "
            }
            keyString = keyString.substring(0, keyString.length -2) + "]";
            console.log(keyString);
        })

        console.log("\nVALS:")
        let valString;
        Object.keys(this._vals).forEach(val=>{
            valString = val + " => [";
            for (let key of this.val(val)){
                valString += key +", "
            }
            valString = valString.substring(0, valString.length -2) + "]";
            console.log(valString);
        })
        console.log("\n\n")
    }
}

if(typeof module === "object" && module.hasOwnProperty('exports')){
    module.exports = Bipartite;
}


