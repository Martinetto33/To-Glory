/*:
 * @plugindesc Contains utility functions, such as assert() and printObject()
 * @author Alin Bordeianu
 * @version 1.0
 * @help
 * This is needed only for development purposes.
 */

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}

// A utility function.
// Use it to see all the properties of JSON objects in the console.
function printObject(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            console.log(key + " -> " + obj[key]);
        }
    }
    console.log("---- NOW STRINGIFYING ----")
    console.log(JSON.stringify(obj))
    console.log("--------------------------")
}
