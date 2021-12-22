const { StorageFileSystem } = require("./Storage")
const { StorageSQLite } = require("./StorageSQLite")




class StorageFactory {
    make(basePath, id) {
        throw NotImplemented()
    }

}

class FileSystemStorageFactory extends StorageFactory {
    make(basePath, id) {
        return new StorageFileSystem(basePath, id)
    }

}


class FileSystemStorageFactoryAsync extends StorageFactory {
    make(basePath, id) {
        return new StorageFileSystemAsync(basePath, id)
    }
}


class SQLiteStorageFactory extends StorageFactory {
    make(basePath, id) {
        return new StorageSQLite(basePath, id)
    }
}


class StorageFactoryAbs {

    static getFactory(factoryType) {
        switch (factoryType) {
            case (StorageType.FileSystemStorage): {
                return new FileSystemStorageFactory()
            }
            case (StorageType.FileSystemStorageAsync): {
                return new FileSystemStorageFactoryAsync()
            }
            case (StorageType.SQLiteStorage): {
                return new SQLiteStorageFactory()
            }

            default: {
                throw new TypeError("Unsupported storage type")
            }

        }
    }
}



const StorageType = {
    FileSystemStorage: Symbol("FileSystemStorage"),
    FileSystemStorageAsync: Symbol("FileSystemStorageAsync"),
    SQLiteStorage: Symbol("SQLiteStorage")
}


module.exports = {
    StorageFactoryAbs: StorageFactoryAbs,
    StorageType: StorageType
}
