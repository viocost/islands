const crc = require("node-crc");
const fs = require("fs")


const bom = '41424344'
const SIZE_BLOB_LENGTH = 10 //10 bytes
const BLOB_HASH_LENGTH = 4


/**
 * Implementation of
 * Append-only file store
 *
 * At the beginning of the file
 */
class AppendOnlyFileStorageV1{

    constructor(pathToFile){
        this._pathToFile = pathToFile;
        if (!fs.existsSync(pathToFile)){
            //create new file here

        }

    }

    getTraverser(){

    }


    appendBlob(blob){
        let hash = takeHash(blob);

    }



    _initiateFile(){
        const a = new ArrayBuffer(4)
        const buffer = new Buffer()

    }

}

class AOFSTraverser{
    constructor(pathToFile){
        this._pathToFile = pathToFile;
    }

    getCurrentBlob(){

    }

    moveBack(){

    }

    moveForward(){

    }
}


function takeHash(blob){
    return crc.crc16(Buffer.from(blob, 'utf8')).toString('hex');
}

function getSizeBlob(blob){
    let size = new Number(blob.length()).toString(16)
    let padding = '0'.repeat(SIZE_BLOB_LENGTH - size.length);
    return [padding, size].join('')
}

function parseSizeBlob(blob){
    return parseInt(blob, 16);
}
