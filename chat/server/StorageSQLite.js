const { Storage } = require("./Storage");
const Sqlite = require("better-sqlite3")
const fs = require("fs-extra");
const path = require("path")
const { isDirContained } = require("./util")
const { BackupAgentSQLite } = require("./BackupAgent");


class StorageSQLite extends Storage {
    static filesTableName = "files_001";

    static isFormatValid(pathToFile){
        try{
            let ref = 'SQLite format 3\x00'
            let buff = Buffer.alloc(16)
            let fd = fs.openSync(pathToFile, "r")
            fs.readSync(fd, buff, 0, 16, 0);
            return ref === buff.toString('utf8')
        }catch(err){
            console.log(`Error during file format checking: ${err}`);
            return false;
        }


    }

    constructor(dbPath, id) {
        if (dbPath === undefined) throw new err.missingParameter('dbPath')
        Storage.ensureDirExist(dbPath)
        super(id);
        this.db = new Sqlite(path.join(dbPath, `${id}`));
        this._prepareDb()
        this._backupAgent = new BackupAgentSQLite(this, path.join(dbPath, "backups"))
    }

    /**
     * Generator function that visits every key in storage exactly once
     */
    allKeys() {
        let stmt = this.db.prepare(`SELECT DISTINCT key FROM ${StorageSQLite.filesTableName}`)
        return stmt.pluck().all()
    }


    /**
     * @param key uniquely identifies a blob
     *
     * The function returns true when blob identified by given key exists.
     */
    has(key) {
        let stmt = this.db.prepare(`SELECT key FROM ${StorageSQLite.filesTableName} WHERE key=@key LIMIT 1`)
        return stmt.all({ key: key }).length > 0;
    }


    /**
     * @param key uniquely identifies a blob
     * @param blob binary object that is stored
     *
     * After this function succeeds the given blob will be present as the _only_ data of this key.
     */
    write(key, blob) {
        let stmt = this.db.prepare(`
                DELETE FROM ${StorageSQLite.filesTableName}
                WHERE key=@key;

        `)
        let stmt2 = this.db.prepare(`
                INSERT INTO ${StorageSQLite.filesTableName} (key, blob, size, offset)
                values (@key, @blob, @size, 0)
        `)

        let transaction = this.db.transaction(data => {
            stmt.run(data)
            stmt2.run(data)
        })
        transaction({ key: key, blob: blob, size: blob.length })
    }

    /**
     * @param key uniquely identifies a blob
     * @param blob binary object that is stored
     *
     * After this function succeeds the given blob will be present as the _last_ data of this key.
     */
    append(key, blob) {
        let stmt = this.db.prepare(`
        WITH previous (offset, size) as
            (SELECT offset, size FROM ${StorageSQLite.filesTableName}
            WHERE key=@key
            ORDER BY offset DESC
            LIMIT 1),
        calculated_offset (offset) as ( SELECT COALESCE((SELECT offset FROM previous), 0) + COALESCE((SELECT size FROM previous), 0) )

        INSERT OR REPLACE INTO ${StorageSQLite.filesTableName} (key, blob, offset, size)
        VALUES (@key, @blob, (SELECT offset from calculated_offset), @size)
    `)

        //console.log(`Writing blob for ${key}, blob: ${blob}`);
        stmt.run({ key: key, blob: blob, size: blob.length })
    }


    /**
     * @param key uniquely identifies a blob
     *
     * After this function succeeds, the return value is the merged blobs in order for the given key.
     */
    getBlob(key) {
        let stmt = this.db.prepare(`
            SELECT blob FROM ${StorageSQLite.filesTableName} WHERE key=?
            ORDER BY offset

            `)
        let res = stmt.pluck().all(key).join('')
        if (res) {
            return res.toString()
        }
    }


    /**
     * @param key uniquely identifies a blob
     * Returns length in bytes of an existing blob
     */
    getLength(key) {
        let stmt = this.db.prepare(`SELECT SUM(size) FROM ${StorageSQLite.filesTableName} WHERE key=@key`)
        let res = stmt.pluck().all({ key: key });
        //console.log(`Storage getLength: Length for key ${key} ${res}`);
        return parseInt(res)
    }

    /**
     * @param key uniquely identifies a blob
     * @param offset number of bytes from start of merged blob
     * @param length number of bytes desired
     *
     * After this function succeeds, the return value is the portion of
     * the merged blobs starting from the offset for length bytes long, or
     * until the end of the last blob if offset + length is greater than
     * overall blob length
     *
     *
     * Args (8, 25)
     *
     * Blobs:
     * 0,10
     * 10,30
     * 40,6
     *
     * All rows with offset is <= 8
     * offset + length <= @offset + @length
     */
    getPartialBlob(key, offset, length) {
        let stmt = this.db.prepare(`
            WITH previous as ( SELECT blob, size, offset FROM ${StorageSQLite.filesTableName}
            WHERE key=@key AND offset <= @offset
            ORDER BY offset DESC
            LIMIT 1 )
            SELECT * FROM previous
            UNION ALL
            SELECT blob, size, offset FROM ${StorageSQLite.filesTableName}
            WHERE key=@key AND offset > @offset AND offset  < @offset + @length
            ORDER BY offset
        `)
        let data = stmt.all({ key: key, offset: offset, length: length });
        if (data.length > 0) {
            let blob = data.map(item => item.blob).join('').toString("utf8")
            let nearestLowerOffset = data[0].offset
            let res = blob.substring(offset - nearestLowerOffset, offset - nearestLowerOffset + length)
            //console.log(`Storage getPartialBlob: Partial blob for key ${key} offset: ${offset}, length: ${length}  blob: ${res}`);
            return res
        } else {
            //console.log("Partial blob not found.");
        }
    }

    /**
     * @param key uniquely identifies a blob
     *
     * After this function succeeds no blob will be present for this key.
     */
    delete(key) {

        let stmt = this.db.prepare(`
                DELETE FROM ${StorageSQLite.filesTableName}
                WHERE key=@key;
        `)
        stmt.run({ key: key })
    }

    kill(){
        this._backupAgent.kill()
        this.db.close();

    }

    enableBackup(){
        this._backupAgent.start()
    }

    _prepareDb() {
        let stmt = this.db.prepare(`CREATE TABLE IF NOT EXISTS ${StorageSQLite.filesTableName} (
            key TEXT,
            offset INTEGER,
            size INTEGER,
            blob BLOB,
            PRIMARY KEY (key, offset)
        )`)

        stmt.run()
        //console.log("Db is ready");
    }
}


module.exports = {
    StorageSQLite: StorageSQLite
}
