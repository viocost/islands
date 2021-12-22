const path = require('path');

/**
 * given a directory and a path returns whether
 * the normalized resolved path is within a given directory
 * strict means dir_ must be strictly a subdirectory of pdir
 */

function isDirContained(parent, subjectDir, strict = true){
    const relative = path.relative(parent, subjectDir);
    return (!strict || relative.length > 0) && !relative.startsWith('..') && !path.isAbsolute(relative);
}

module.exports = {
    isDirContained: isDirContained

}
