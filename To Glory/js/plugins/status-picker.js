/*:
 * @author Alin Bordeianu
 * @plugindesc Plugin used to extract statuses from actors
 */

// JSON object containing states ids
var negativeStatusesJSON = {
    "poisoned": 3, 
    "bleeding": 6, 
    "restricted": 7,
    "burning": 23,
    "hunter_mark": 22
}

var negativeStatuses = [3, 6, 7, 23, 22]; // if I remove this semicolon everything explodes, 
// and this array is interpreted as a function. WTF RPG Maker

(() => {
    const _Game_Action_apply = Game_Action.prototype.apply
    Game_Action.prototype.apply = function(target) {
        _Game_Action_apply.call(this, target)
        if (this.isItem()) {
            const item = this.item()
            if (item.id === BEZOAR_ID) {
                healRandomStatus(target)
            }
        }
    }
})()

/**
 * This function is here to help with the effect of the bezoar,
 * which removes a random status from one of the players.
 * Takes a partyMember and checks if it has any statuses.
 * If yes, selects randomly one of the statuses from the given player
 * and returns its id. This can be used to remove it with
 * 
 *  partyMember.removeState(stateID)
 * 
 * 
 * If no statuses for the player are available, returns null.
 * 
 * 
 * Useful variables might be:
 * $gameParty (contains all the actors in the party)
 * $dataStates (contains all the states existing in the database)
 */
function healRandomStatus(target) {
    const partyMember = BattleManager._subject
    if (partyMember && partyMember.isActor()) {
        console.log(`Actor using the item: ${partyMember.name()}; target = ${target.name()}`)
    }
    let allPartyMemberStates = target._states
        .filter(state => state) // checks if state is not null
    console.log("All states found for " + target.name() + ": " + allPartyMemberStates)
    // This array will only contain the negative states.
    let partyMemberStates = filterAllNegativeStates(allPartyMemberStates, target.name())
    // Selecting a random status
    if (partyMemberStates.length > 0) {
        let index = Math.floor(Math.random() * partyMemberStates.length)
        let id = partyMemberStates[index]
        partyMember.removeState(id)
        console.log(`Removed state ${id} from ${target.name()}!`)
    } else {
        console.log(`No negative states found for actor ${target.name()}`)
    }
}

function filterAllNegativeStates(array, entityName) {
    //console.log("In filter: array = " + JSON.stringify(array))
    let partyMemberNegativeStates = [];
    for (i = 0; i < array.length; i++) {
        if (isNegativeState(array[i].id)) {
            console.log(`Actor ${entityName} is affected by negative status ${array[i].name}!`)
            partyMemberNegativeStates.push(array[i])
        }
    }
    //console.log("Filtered array = " + JSON.stringify(partyMemberNegativeStates))
    return partyMemberNegativeStates
}

function isNegativeState(stateId) {
    return negativeStatuses.includes(stateId)
}
