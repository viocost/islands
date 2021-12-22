const { NotImplemented } = require("../common/Error")
const fs = require("fs-extra")
const path = require("path")

/**
  * This class performs automatic backups of a given storage object.
 */
class BackupAgent{

    /**
     * @param storage - storage object
     * @param backupDir - path to backup directory
     * @param backupIntervalMs - backup interval in milliseconds
     * @param backaupLifespanHr - backup lifespan in hours. All older backups automatically deleted.
     *                            if this parameter is null - deleting older backups will be disabled
     *
     *
     */
    constructor(storage, backupDir, backupIntervalMs = 7200000, backupLifespanHr = 72){

    }

    /**
     * Starts auto backup worker
     */
    start(){
        throw new NotImplemented()
    }


    /**
     * Stops auto backup worker
     */
    kill(){

    }
}


class BackupAgentSQLite extends BackupAgent{

    constructor(storage, backupDir, backupIntervalMs = 7200000, backupLifespanHr = 72){
        super()

        this.storage = storage;

        this.backupDir = path.join(backupDir, storage.id);
        fs.ensureDirSync(this.backupDir)

        //Backup interval in milliseconds
        this.intervalMs = backupIntervalMs;

        //Backup time to live in hours
        //All older backups will be deleted automatically
        this.backupLifespanHr = backupLifespanHr;
    }

    start(){
        console.log("Starting backup agent");
        this.interval = setInterval(()=>{
            this.performBackup(); this.performCleanup();
        }, 4000)
    }

    kill(){

        console.log("Killing backup agent");
        clearInterval(this.interval);
    }

    performBackup(){

        //find last backup
        //if it was made more than backupInvtervalMs => do a backup
        //


        if(this._isTimeToBackup()){
            console.log("Time to backup");
            this.storage.db.backup(path.join(this.backupDir, this._getBackupFilename()))
                .then(console.log(`Backup completed on storage ${this.storage.id}`))
                .catch(err=> console.log(`Storage backup error: ${err}`))
        }
    }

    _getBackupFilename() {
        return `${new Date().toISOString()}`.replace(/[:.-]/g, "_") // Replacing colons so windows don't get confused
    }

    performCleanup(){

        //Read files, filter by id, remove any older than  2
        let files = fs.readdirSync(this.backupDir)
        for (let file of files){
            if (this._isBackupExpired(file)){
                fs.unlink(path.join(this.backupDir, file))
                  .then(()=>console.log("old backup removed"))
                  .catch(err=>console.log(`Error removing old backup ${err}`))
            }
        }
    }

    /**
     * Returns true if last backup has been made more than
     * backupIntervalMs ago or there is no backups at all
     */
    _isTimeToBackup(){

        let files = fs.readdirSync(this.backupDir)
        let latest = files.reduce((acc, item)=> Math.max(fs.lstatSync(path.join(this.backupDir, item)).birthtime, acc), 0)
        let differenceMs = new Date() - latest; //timestamp difference between now and last bakcup
        return  differenceMs > this.intervalMs;
    }

    _isBackupExpired(file){
        try{
            let birthTime = fs.statSync(path.join(this.backupDir, file)).birthtime
            let diffHours = (new Date() - birthTime) / 1000 / 60 / 60
            return diffHours > this.backupLifespanHr
        } catch (err){
            return false
        }

    }
}



module.exports = {
    BackupAgentSQLite: BackupAgentSQLite
}
