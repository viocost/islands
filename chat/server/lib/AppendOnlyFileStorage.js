const crc = require("node-crc");
const fs = require("fs")


const bom = '41424344'
const SIZE_BLOB_LENGTH = 10  // bytes
const BLOB_HASH_LENGTH = 4   // bytes
const DATE_BLOB_LENGTH = 11  // bytes


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
            fs.appendFileSync(this._pathToFile, this._getBOM())

        }

    }

    getTraverser(){
        return new AOFSTraverser(this._pathToFile)

    }

    appendBlob(blob){
        let hash = takeHash(blob);
        let size = getSizeBlob(blob)
        let date = getDateBlob();
        const data = Buffer.from(`${size}${blob}${hash}${date}${size}`)
        fs.appendFileSync(this._pathToFile, data);
    }



    _getBOM(){
        const buffer = new ArrayBuffer(4)
        const view = new Uint8Array(buffer)
        view[0] = 0x41
        view[1] = 0x42
        view[2] = 0x43
        view[3] = 0x44
        return view;
    }

    _readBOM(){
        const buffer = new ArrayBuffer(4)
        const stream = fs.createReadStream(this._pathToFile, {start: 0, end: 3})
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


function getDateBlob(){
    return Number(new Date).toString(16)
}

function parseDateBlob(blob){
    return new Date(parseInt(blob, 16))
}

function parseSizeBlob(blob){
    return parseInt(blob, 16);
}
