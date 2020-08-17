const crc = require("node-crc");
const fs = require("fs")
const { createDerivedErrorClasses  } = require("../../common/DynamicError")
const Err = require("../../common/Error")


class AOFSError extends Error{ constructor(data){ super(data); this.name = "AOFSError" } }

const localErr = createDerivedErrorClasses(AOFSError, {
    fileNotFound: "FileNotFound"
})


/**
 * File format:
 * <next_blob_size_in_hex><blob><hash><date_in_hex><seq_in_hex><prev_blob_size_in_hex>
 */


const BOM = '41424344' //byte ordering marker
const BOM_LENGTH = 4;
const SIZE_BLOB_LENGTH = 10  // bytes
const BLOB_HASH_LENGTH = 4   // bytes
const DATE_BLOB_LENGTH = 11  // bytes
const SEQ_SIZE = 4           // bytes


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
            fs.writeFileSync(this._pathToFile, this._getBOM(), {encoding: 'hex'})
        }

        this._lastSeq = this._getLastSeq()



    }

    getTraverser(){


        //return new AOFSTraverser(this._pathToFile)

    }

    appendBlob(blob){
        let seq = this._lastSeq + 1
        let hash = takeHash(blob);
        let size = getSizeBlob(blob)
        let date = getCurrentDateBlob();
        const data = Buffer.from(`${size}${blob}${hash}${date}${seq}${size}`)
        fs.appendFileSync(this._pathToFile, data);
        this._lastSeq++;
    }



    _getBOM(){
        const uint8Array = new Uint8Array(4)
        uint8Array[0] = 0x41
        uint8Array[1] = 0x42
        uint8Array[2] = 0x43
        uint8Array[3] = 0x44

        return uint8Array;
    }

    _readBOM(){
        const int8Array = new Uint8Array(4)
        const fd = fs.openSync(this._pathToFile, "r")
        fs.readSync(fd, int8Array, 0, 4, null)
        return int8Array;
    }

    _getLastSeq(){
        let fileSize = fs.statSync(this._pathToFile).size
        if (fileSize <= 4) return 0
        let seqPos = fileSize - SIZE_BLOB_LENGTH - SEQ_SIZE;
        let fd = fs.openSync(this._pathToFile, "r")
        const seqArray = new Uint8Array(SEQ_SIZE);
        fs.readSync(fd, seqArray, seqPos, SEQ_SIZE, null)


    }


}

class AOFSTraverser{
    constructor(pathToFile){
        if(this.constructor === AOFSTraverser){
            throw new Err.AttemptToInstatiateBaseClass()
        }
        this._pathToFile = pathToFile;
    }


    getCurrentBlob(){
        throw new Err.NotImplemented()
    }

    traverseBack(){
        throw new Err.NotImplemented()
    }

    traverseForward(){
        throw new Err.NotImplemented()
    }
}

class AOFSTraverserLE extends AOFSTraverser{
    constructor(pathToFile){
        super(pathToFile)

        this._currentBlobStart;
        this._currentBlobSize;

    }

    getCurrentBlob(){

    }

    traverseBack(){

    }

    traverseForward(){

    }
}


class AOFSTraverserBE extends AOFSTraverser{
    constructor(pathToFile){
        super()
        this._pathToFile = pathToFile;
        if(!fs.existsSync(pathToFile)){
            throw new localErr.fileNotFound(pathToFile);
        }

    }

    getCurrentBlob(){
        throw new Err.NotImplemented()
    }

    traverseBack(){
        throw new Err.NotImplemented()
    }

    traverseForward(){
        throw new Err.NotImplemented()
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


function getCurrentDateBlob(){
    return Number(new Date).toString(16)
}

function parseDateBlob(blob){
    return new Date(parseInt(blob, 16))
}

function parseSizeBlob(blob){
    return parseInt(blob, 16);
}


module.exports = {
    AppendOnlyFileStorageV1: AppendOnlyFileStorageV1,
}
