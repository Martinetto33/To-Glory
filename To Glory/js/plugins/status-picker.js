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

var negativeStatuses = [3, 6, 7, 23, 22]
    

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
function selectRandomStatusIDFromPartyMember() {
    const partyMember = BattleManager._subject
    if (partyMember && partyMember.isActor()) {
        console.log(`Actor using the item: ${partyMember.name()}`)
    }
    let allPartyMemberStates = partyMember._states
        .filter(state => state) // checks if state is not null
    // This array will only contain the negative states.
    let partyMemberStates = filterAllNegativeStates(allPartyMemberStates, partyMember.name())
    // Selecting a random status
    if (partyMemberStates.length > 0) {
        let index = getRandomInt(partyMemberStates.length)
        let id = partyMemberStates[index].id
        partyMember.removeState(id)
        console.log(`Removed state ${id} from ${partyMember.name()}!`)
    } else {
        console.log(`No states found for actor ${partyMember.name()}`)
    }
}

function filterAllNegativeStates(array, entityName) {
    partyMemberNegativeStates = []
    for (i = 0; i < array.length; i++) {
        if (isNegativeState(array[i].id)) {
            console.log(`Actor ${entityName} is affected by negative status ${array[i].id}!`)
            partyMemberNegativeStates.push(array[i])
        }
    }
    return partyMemberNegativeStates
}

function isNegativeState(stateId) {
    return negativeStatuses.includes(stateId)
}
