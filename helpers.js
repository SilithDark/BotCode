/**
 * Converts a number to its miliseconds version, for use in timeouts. 
 *
 * @param {any} number 
 */
exports.toMilliseconds = function (number) {
    return number * 60 * 1000;
}