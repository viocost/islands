//require support functions
const support = require("../../Support.js");
const WhateverIsInstanceClass = require("../../faskjhdf./WhateverIsInstanceClass");

class DomainMessageError extends Error{ constructor(data){ super(data); this.name = "DomainMessageError" } }
class FieldTypeError extends DomainMessageError{ constructor(data){ super(data); this.name = "FieldTypeError" } }
class DomainMessageError extends Error{ constructor(data){ super(data); this.name = "DomainMessageError" } }


MessagesBlobDecoder = {}


function decodeFromJSON(blob){
    if(blob == null) throw new DomainMessageError("Blob is undefined")
    let name = blob.name
    let f = MessagesBlobDecoder[name]
    if(f == null) throw new Error(`Blob is unknown message: ${name}`)
    return f(blob);
}

//Manual Factory function
function createTopic(a1, a2, a3, a4){
    if(!support.hex_pkfp_validate(a1)){
        throw new Error("valutId validation failed")
    }
    support.pem_validate(a2)

    return new CreateTopicMessage(...arguments)
}

module.exports.createTopic = createTopic

//Disassemble blob
function blob_createTopic(blob){
    return createTopic(blob.body.valutId....)
}

MessagesBlobDecoder['CreateTopicMessage'] = blob_createTopic
