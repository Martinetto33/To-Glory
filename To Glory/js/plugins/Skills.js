/**:
 * @plugindesc Plugin that implements some unconventional skills for actors.
 * @author Alin Bordeianu
 * @version 1.0
 * 
 * @help
 * Prova
 */

/**
 * This function inflicts damage to all entities affected by bleeding.
 */
function inflictBleeding(entitiesArray) {
    entitiesArray.forEach(entity => {
        if (entity.isStateAffected(6)) { // 6 stands for bleeding
            const numberOfNegativeStatesOfEntity = filterAllNegativeStates(entity.states(), entity.name()).length
            // Bleeding inflicts more damage if there are other negative states on the entity.
            const damage = Math.floor(entity.mhp * 0.05 + (entity.mhp * 0.05 * numberOfNegativeStatesOfEntity))
            console.log(`Inflicting ${damage} damage to entity ${entity.name()}`)
            entity.gainHp(-damage)
            entity.startDamagePopup() // shows the damage number
            // entity.startAnimation(ANIMATION_ID) // to show bleeding animation

            // Checking for death and handling it
            if (entity.isDead()) {
                entity.performCollapse() // this is the proper way to kill an entity
            }
        }
    })
}

/**
 * To avoid having to manually add a common event call for every troop and/or actor,
 * we just add a function to the GameBattler that automatically checks
 * at the end of each turn if there are any enemies affected by bleeding.
 * Game_Battler represents a single entity. Its onTurnEnd method is called once for each
 * entity involved in battle.
 * To do something only once per turn, use BattleManager.
 */
(() => {
    const _BattleManager_endTurn = BattleManager.endTurn
    BattleManager.endTurn = function() { // overriding endTurn
        _BattleManager_endTurn.call(this) // this call allows to keep old logic, and then apply the bleeding logic at the end
        console.log("Strange game battler code called")
        inflictBleeding($gameParty.members())
        inflictBleeding($gameTroop.members())
    }
})()