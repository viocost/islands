/**
 * returns true if min <= x <= max and incluisive
 * or true if  min < x < max and not incluisive
 * otherwise false.
 *
 *
 */
function inRange(x, min, max, inclusive=true) {
    let temp = (x-min)*(x-max)
    return inclusive ? temp <= 0 : temp < 0;
}

function asArray(item){
    if(Array.isArray(item)) return item
    return [item];
}



function getRandomString(length=10){

}

module.exports = {
    inRange: inRange,
    asArray: asArray
}
