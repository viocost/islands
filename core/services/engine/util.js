const fs = require('fs');
const path = require("path")

/**
 * Given a path - deletes the object if it exists with all its content
 * The object at path can be a file or a directory.
 *
 */
function removeItem(itemPath){

    if(!fs.existsSync(itemPath)){
        return
    }

    if (isFile(itemPath) || isSymlink(itemPath)){
        fs.unlinkSync(itemPath)
    } else if (isDir(itemPath)){
        for (let item of fs.readdirSync(itemPath)){
            let fullPath = path.join(itemPath, item)
            if(isDir(fullPath)){
                removeItem(fullPath)
            } else {
                fs.unlinkSync(fullPath)
            }
        }

        fs.rmdirSync(itemPath)
    } else {
        throw new Error("Unsupported object")
    }
}

//Given source and dest directory will
//copy source into dest entirely
// Ex: /some/path/source  /some/path/dest/    will result in
// /some/path/dest/source/
function copy(source, dest){
    if (!fs.existsSync(source)){
        throw new ValueError("Source does not exist")
    }

    if(!fs.existsSync(dest)){
        fs.mkdirSync(dest)
    }

    if(!isDir(dest)){
        throw new ValueError("Dest must be a directory.")
    }

    if(isFile(source)){
        let filename = lastPathElement(source)
        fs.copyFileSync(source, path.join(dest, filename))
    } else {
        let dirname = lastPathElement(source)
        let nestedDir = path.join(dest, dirname)
        fs.mkdirSync(nestedDir)
        for(let item of fs.readdirSync(source)){
            copy(path.join(source, item), nestedDir)
        }
    }
}

function isFile(_path){
    return fs.statSync(_path).isFile()
}

function isSymlink(_path){
    return fs.lstatSync(_path).isSymbolicLink()
}

function isDir(_path){
    return fs.statSync(_path).isDirectory()
}


function lastPathElement(_path){
    return _path.split(path.sep).splice(-1)[0]
}

module.exports = {
    isDir: isDir,
    removeItem: removeItem,
    copy: copy
}
