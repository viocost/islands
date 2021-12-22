const { ObjectCollection } = require("../common/ObjectCollection")
const { assert } = require("chai")

class Thing{
    constructor(id){
        this.id = id
    }

}


describe("Testing Object collection API", ()=>{
    before(()=>{

        this.c = new ObjectCollection(obj=>obj.id, obj=>obj instanceof Thing)

        this.t1 = new Thing("a")
        this.t2 = new Thing("b")
        this.c.add(this.t1)
        this.c.add(this.t2)
    })

    it("Shold test collection", ()=>{
        assert(this.c.length === 2)
        assert (this.c.get("a") === this.t1)
    })
})
