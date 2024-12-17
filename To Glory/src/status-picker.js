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
(function() { // this is a IIFE (Immediately Invoked Function Expression): https://developer.mozilla.org/en-US/docs/Glossary/IIFE
    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    function selectRandomStatusIDFromPartyMember() {
        const partyMember = BattleManager._subject;
        if (!partyMember || !partyMember.isActor()) {
            console.log("No valid actor is currently performing an action.");
            return;
        }

        console.log(`Actor using the item: ${partyMember.name()}`);
        const partyMemberStates = partyMember._states.filter(Boolean); // Filter out null/undefined

        if (partyMemberStates.length > 0) {
            const randomStateId = partyMemberStates[getRandomInt(partyMemberStates.length)];
            partyMember.removeState(randomStateId); // Remove the state by ID
            console.log(`Removed state ID: ${randomStateId}`);
        } else {
            console.log(`No states found for actor ${partyMember.name()}`);
        }
    }

    // Expose function to global scope
    window.selectRandomStatusIDFromPartyMember = selectRandomStatusIDFromPartyMember;
})();

