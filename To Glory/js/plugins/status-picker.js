/**:
 * @author Alin Bordeianu
 * @plugindesc Plugin used to extract statuses from actors
 */

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
    let partyMemberStates = partyMember._states
        .filter(state => state) // checks if state is not null
    // Selecting a random status
    if (partyMemberStates.length > 0) {
        let index = getRandomInt(partyMemberStates.length)
        partyMember.removeState(partyMemberStates[index].id)
    } else {
        console.log(`No states found for actor ${partyMember.name()}`)
    }
}
