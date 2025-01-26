/*:
 * @author Alin Bordeianu
 * @plugindesc Plugin used to extract statuses from actors
 */

var negativeStatuses = [
    POISONED_STATE_ID, 
    BLEEDING_STATE_ID, 
    RESTRICTED_STATE_ID, 
    BURNING_STATE_ID, 
    HUNTER_MARK_STATE_ID, 
    DEFENSE_DOWN_STATE_ID, 
    PARALYZED_STATE_ID
]; // if I remove this semicolon everything explodes, 
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
        // console.log(`Actor using the item: ${partyMember.name()}; target = ${target.name()}`)
    }
    let allPartyMemberStates = target.states()
        .filter(state => state) // checks if state is not null
    // console.log("All states found for " + target.name() + ": " + JSON.stringify(allPartyMemberStates))
    // This array will only contain the negative states.
    let partyMemberStates = filterAllNegativeStates(allPartyMemberStates, target.name())
    // Selecting a random status
    if (partyMemberStates.length > 0) {
        let index = Math.floor(Math.random() * partyMemberStates.length)
        let stateToRemove = partyMemberStates[index]
        target.removeState(stateToRemove.id)
        console.log(`[BEZOAR]: Removed state ${stateToRemove.name} from ${target.name()}!`)
    } else {
        console.log(`[BEZOAR]: No negative states found for actor ${target.name()}`)
    }
}

/**
 * Filters all negative states listed in the {@link negativeStatuses}
 * array.
 * @param {Array<State>} array it MUST be an array of objects, not the list of state ids!
 * @param {String} entityName the name to print in the console.
 * @returns an array containing the filtered states.
 */
function filterAllNegativeStates(array, entityName) {
    //console.log("In filter: array = " + JSON.stringify(array))
    let partyMemberNegativeStates = [];
    for (i = 0; i < array.length; i++) {
        if (isNegativeState(array[i].id)) {
            // console.log(`Actor ${entityName} is affected by negative status ${array[i].name}!`)
            partyMemberNegativeStates.push(array[i])
        }
    }
    //console.log("Filtered array = " + JSON.stringify(partyMemberNegativeStates))
    return partyMemberNegativeStates
}

function isNegativeState(stateId) {
    return negativeStatuses.includes(stateId)
}
