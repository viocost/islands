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

module.exports = {
    inRange: inRange
}
