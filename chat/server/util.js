const path = require('path');

/**
 * given a directory and a path returns whether
 * the normalized resolved path is within a given directory
 */
function isContained(pdir_, dir_) {
    var pdir = path.resolve(path.normalize(pdir_)) + (path.sep || '/');
    var dir = path.resolve(pdir, path.normalize(dir_));
    if (pdir === '//') pdir = '/';
    if (pdir === dir) return false;
    return dir.slice(0, pdir.length) === pdir;
};



module.exports = {
    isContained: isContained
}
