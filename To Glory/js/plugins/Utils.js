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

/**
 * 
 * @param {String} longText 
 * @param {Number} maxWidth 
 * @param {Number} characterWidth 
 * @returns 
 */
function lineWrap(longText, maxWidth, characterWidth = 14) {
    const maxCharactersPerLine = Math.floor(maxWidth / characterWidth)
    let wrappedText = ""
    let remainder = longText
    while (remainder.length > 0) {
        if (remainder.length <= maxCharactersPerLine) {
            wrappedText = wrappedText + remainder.trim()
            break
        }
        let nextLine = remainder.substring(0, maxCharactersPerLine).trim()
        console.log(nextLine.length)
        let cutIndex = maxCharactersPerLine
        if (!isSpace(remainder[maxCharactersPerLine])) {
            // I broke a word in half, so I need to attach it to the front of the remainder
            cutIndex = nextLine.lastIndexOf(" ")
            if (cutIndex === -1) {
                // No spaces in the line, force break the word
                cutIndex = maxCharactersPerLine
            } else {
                nextLine = remainder.substring(0, cutIndex).trim()
            }
        }
        wrappedText = wrappedText + nextLine + "\n"
        console.log("wrappedText = {" + wrappedText + "}\n----\n")
        remainder = remainder.substring(cutIndex).trim()
    }
    return wrappedText
}

function isSpace(character) {
    return character === " " || character === "\n"
}

/**
 * Picks and returns a random element in the array
 * @param {Array<Any>} array 
 */
function pick(array) {
    if (!Array.isArray(array)) {
        return null
    }
    if (array.length !== 0) {
        return array[Math.floor(Math.random() * array.length)]
    }
    return null
}
