const { createDerivedErrorClasses } = require("../common/DynamicError");
const { NotImplemented } = require("../common/Error")
const fs = require("fs-extra");
const path = require("path")
const { isDirContained } = require("./util")

const KeyBuilder = require("./StorageKeyBuilderAdapter")

class StorageError extends Error { constructor(data) { super(data); this.name = "StorageError" } }


const err = createDerivedErrorClasses(StorageError, {
    notExist: "BlobNotExist",
    missingParameter: "MissingRequiredParameter"
})

class Storage {
    backupAgent;

    static ensureDirExist(dirPath) {
        fs.ensureDirSync(dirPath)
    }

    static deleteStorage(storage) {
        storage.kill()
        delete Storage.storageObjects[storage.id]
    }


    //Key path separator used to build paths
    //It does not depend on OS, but it is expected as a default separator in key
    //If key consists of multiple parts this separator must be used, otherwise the key will be interprited incorrectly.
    static SEP = "/"

    constructor(id) {
        this.id = id
        Storage.storageObjects[id] = this;
        console.log(`Total storage objects: ${Storage.storageObjects.size}`);
    }


    static * everyStorageObject() {
        for (let id in Storage.storageObjects) {
            yield Storage.storageObjects[id];
        }
    }

    static storageObjects = new Map();

    static getByIdentity(id) {
        return Storage.storageObjects[id]
    }

    static getAllByKeyPresent(key) {
        let result = []
        for (let storage of Storage.everyStorageObject()) {
            if (storage.has(key)) {
                result.push(storage)
            }
        }

        return result;
    }

    /**
     * Generator function that visits every key in storage exactly once
     */
    allKeys() {
        throw new NotImplemented()
    }

    /**
     * @param key uniquely identifies a blob
     *
     * The function returns true when blob identified by given key exists.
     */
    has(key) {
        throw new NotImplemented()
    }


    /**
     * @param key uniquely identifies a blob
     * @param blob binary object that is stored
     *
     * After this function succeeds the given blob will be present as the _only_ data of this key.
     */
    write(key, blob) {
        throw new NotImplemented()

    }

    /**
     * @param key uniquely identifies a blob
     * @param blob binary object that is stored
     *
     * After this function succeeds the given blob will be present as the _last_ data of this key.
     */
    append(key, blob) {
        throw new NotImplemented()
    }


    /**
     * @param key uniquely identifies a blob
     *
     * After this function succeeds, the return value is the merged blobs in order for the given key.
     */
    getBlob(key) {
        throw new NotImplemented()
    }

    /**
     * @param key uniquely identifies a blob
     * Returns length in bytes of an existing blob
     */
    getLength(key) {
        throw new NotImplemented()
    }

    /**
     * @param key uniquely identifies a blob
     * @param offset number of bytes from start of merged blob
     * @param length number of bytes desired
     *
     * After this function succeeds, the return value is the portion of
     * the merged blobs starting from the offset for length bytes long.
     */
    getPartialBlob(key, offset, length) {
        throw new NotImplemented()
    }

    /**
     * @param key uniquely identifies a blob
     *
     * Returns sum of the lengths of all merged blobs
     */
    getMergedBlobLength(key) {
        throw new NotImplemented()
    }

    /**
     * @param key uniquely identifies a blob
     *
     * After this function succeeds no blob will be present for this key.
     */
    delete(key) {
        throw new NotImplemented()
    }

    /**
     * Gracefully stops storage object and does necessary cleanup.
     */
    kill(){/* By default nothing here. Implement this function if cleanup needed. */}
}


/**
 * This is a temporary implementation of file storage.
 * It exists until we move storage to SQLite
 *
 * Key is always a path to a file and value - its content.
 *
 */
class StorageFileSystem extends Storage {


    constructor(basePath, id) {
        super(id)
        this.ensureDirExists(basePath)
        this.basePath = basePath

    }


    // Returns true if key resolves to an existing file.
    has(key) {

        try {
            let fullPath = this.getPath(key)
            let stat = fs.statSync(fullPath)
            return stat.isFile();
        } catch (err) {
            return false
        }
    }

    // Given a directory returns all files in it
    getKeys(dirPath) {
        return fs.readdirSync(path.join(this.basePath, dirPath)).filter(item => {
            return fs.lstatSync(this.getPath(dirPath, item)).isFile()
        })
    }

    allKeys(keyPrefix = []) {

        let keys = []

        let curDir = path.join(this.basePath, ...keyPrefix)

        let content = fs.readdirSync(curDir)

        for (let item of content) {
            let stat = fs.statSync(path.join(curDir, item))
            let newPrefix = keyPrefix.map(i => i);

            if (stat.isDirectory()) {
                newPrefix.push(item);
                keys = keys.concat(this.allKeys(newPrefix))
            } else {
                keys.push(KeyBuilder.buildKey(...newPrefix, item))
            }
        }


        return keys
    }

    //Last atom of key will be treated as filename
    //All preceeding atoms will be treated as subdirectories.
    //
    write(key, value) {
        this.preWrite(key);
        fs.writeFileSync(this.getPath(key), value)
    }

    //appends blob to existing blob
    append(key, value) {
        this.preWrite(key);
        fs.appendFileSync(this.getPath(key), value)
    }


    //Successful execution of this function guaranties that
    // 1. key is valid
    // 2. the path to potential write operation is within the base directory
    // 3. the directory for the key is prepared and exist.
    preWrite(key) {
        let dirPath = this.getDirPath(key);
        if (!isDirContained(this.getBasePath(), dirPath, false)) {
            throw new Error(`Attempt to write outside of storage base directory: ${dirPath}`)
        }

        fs.ensureDirSync(dirPath)
    }

    getBlob(key) {
        let atoms = KeyBuilder.decomposeKey(key);
        let blobPath = path.join(this.basePath, ...atoms);

        console.log(`Trying to get blob ${blobPath}`);

        if (!fs.existsSync(blobPath)) {
            throw new err.notExist(blobPath);
        }

        return fs.readFileSync(blobPath, "utf8")
    }

    getPartialBlob(key, offset, length) {

        let stats = fs.statSync(this.getPath(key));
        let fd = fs.openSync(this.getPath(key));

        length = length || stats.size
        let buffer = Buffer.alloc(length)
        fs.readSync(fd, buffer, 0, length, offset);
        let partialBlob = buffer.toString("utf8");
        return partialBlob
    }

    delete(key) {

        let atoms = key.split(KeyBuilder.SEP);
        atoms = atoms.slice(0, atoms.length - 1);

        fs.unlinkSync(this.getPath(key))

        for (; ;) {

            let dirPath = path.join(this.basePath, ...atoms);
            let content = fs.readdirSync(dirPath);
            if (content.length > 0 || !isDirContained(this.basePath, dirPath)) {
                break
            }

            fs.rmdirSync(dirPath);
            atoms = atoms.slice(0, atoms.length - 1);
        }


    }



    ensureDirExists(dirPath) {
        fs.ensureDirSync(dirPath)
    }

    //given a key joins it with base path and returns
    //If key consists of multiple atoms it must use
    //KeyBuilder.SEP as separator, or it won't be interprited correctly
    getPath(key) {
        let atoms = key.split(KeyBuilder.SEP)
        return path.join(this.basePath, ...atoms)
    }

    //Returns dir path of a given key
    getDirPath(key) {
        let atoms = KeyBuilder.decomposeKey(key)
        return path.join(this.getBasePath(), ...atoms.slice(0, atoms.length - 1))
    }

    getBasePath() {
        return this.basePath

    }

    getLength(key) {
        let pathToBlob = this.getPath(key)
        let stat = fs.statSync(pathToBlob);
        if (!stat.isFile()) {
            throw new TypeError("Key must lead to a file.")
        }
        return stat.size
    }
}


class StorageFileSystemAsync extends StorageFileSystem {
    constructor(basePath, id) {
        super(basePath, id)
    }

    async has(key) {

    }


    // Given a directory returns all files in it
    async getKeys(dirPath) {
        return await fs.readdir(path.join(this.basePath, dirPath)).filter(item => {
            return fs.lstatSync(this.getPath(dirPath, item)).isFile()
        })
    }

    async allKeys(keyPrefix = []) {

        let keys = []

        let curDir = path.join(this.basePath, ...keyPrefix)

        let content = fs.readdirSync(curDir)

        for (let item of content) {
            let stat = fs.statSync(path.join(curDir, item))
            let newPrefix = keyPrefix.map(i => i);

            if (stat.isDirectory()) {
                newPrefix.push(item);
                keys = keys.concat(this.allKeys(newPrefix))
            } else {
                keys.push(KeyBuilder.buildKey(...newPrefix, item))
            }
        }


        return keys
    }

    //Last atom of key will be treated as filename
    //All preceeding atoms will be treated as subdirectories.
    //
    async write(key, value) {
        this.preWrite(key);
        await fs.writeFile(this.getPath(key), value)
    }

    //appends blob to existing blob
    async append(key, value) {
        this.preWrite(key);
        await fs.appendFile(this.getPath(key), value)
    }


    //Successful execution of this function guaranties that
    // 1. key is valid
    // 2. the path to potential write operation is within the base directory
    // 3. the directory for the key is prepared and exist.
    preWrite(key) {
        let dirPath = this.getDirPath(key);
        if (!isDirContained(this.getBasePath(), dirPath, false)) {
            throw new Error(`Attempt to write outside of storage base directory: ${dirPath}`)
        }

        fs.ensureDirSync(dirPath)
    }

    async getBlob(key) {
        let atoms = KeyBuilder.decomposeKey(key);
        let blobPath = path.join(this.basePath, ...atoms);

        console.log(`Trying to get blob ${blobPath}`);

        if (!fs.existsSync(blobPath)) {
            throw new err.notExist(blobPath);
        }

        return await fs.readFile(blobPath, "utf8")
    }

    async getPartialBlob(key, offset, length) {

        let stats = fs.statSync(this.getPath(key));
        let fd = fs.openSync(this.getPath(key));

        length = length || stats.size
        let buffer = Buffer.alloc(length)
        await fs.read(fd, buffer, 0, length, offset);
        let partialBlob = buffer.toString("utf8");
        return partialBlob
    }

    async delete(key) {

        let atoms = key.split(KeyBuilder.SEP);
        atoms = atoms.slice(0, atoms.length - 1);

        await fs.unlink(this.getPath(key))

        for (; ;) {

            let dirPath = path.join(this.basePath, ...atoms);
            let content = fs.readdirSync(dirPath);
            if (content.length > 0 || !isDirContained(this.basePath, dirPath)) {
                break
            }

            await fs.rmdir(dirPath);
            atoms = atoms.slice(0, atoms.length - 1);
        }


    }



    ensureDirExists(dirPath) {
        fs.ensureDirSync(dirPath)
    }

    //given a key joins it with base path and returns
    //If key consists of multiple atoms it must use
    //KeyBuilder.SEP as separator, or it won't be interprited correctly
    getPath(key) {
        let atoms = key.split(KeyBuilder.SEP)
        return path.join(this.basePath, ...atoms)
    }

    //Returns dir path of a given key
    getDirPath(key) {
        let atoms = KeyBuilder.decomposeKey(key)
        return path.join(this.getBasePath(), ...atoms.slice(0, atoms.length - 1))
    }

    getBasePath() {
        return this.basePath

    }

    async getLength(key) {
        let pathToBlob = this.getPath(key)
        let stat = await fs.stat(pathToBlob);
        if (!stat.isFile()) {
            throw new TypeError("Key must lead to a file.")
        }
        return stat.size
    }
}


module.exports = {
    Storage: Storage,
    StorageFileSystem: StorageFileSystem,
    StorageFileSystemAsync: StorageFileSystemAsync,
}
