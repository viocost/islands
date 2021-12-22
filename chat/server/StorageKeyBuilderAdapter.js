const SEP = "/"

function  buildKey(...atoms) {

        atoms = atoms.filter(atom => typeof atom === "string" && atom);

        if (atoms.length === 0) {
            throw new TypeError("There must be at least one atom to build a key")
        }

        return atoms.join(SEP);
}

function decomposeKey(key) {
    return key.split(SEP);
}


module.exports = {
    buildKey: buildKey,
    decomposeKey: decomposeKey,
    SEP: SEP
}
