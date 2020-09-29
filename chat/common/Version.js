class IslandsVersion{
    static version;
    static getVersion(){
        return IslandsVersion.version
    }

    static setVersion(version){
        IslandsVersion.version = version;
    }
}



module.exports = {
    IslandsVersion: IslandsVersion
}
