/*:
 * @plugindesc Plugin that implements some unconventional skills for actors.
 * @author Alin Bordeianu
 * @version 1.0
 * 
 * @help
 * Prova
 */

var didAvalancheTakePlace = false

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
        didAvalancheTakePlace = false
    }

    // adding damage forwarding for grappling effect
    const _Game_Battler_gainHP = Game_Battler.prototype.gainHp
    Game_Battler.prototype.gainHp = function(value) {
        _Game_Battler_gainHP.call(this, value)
        console.log("Called Game_Action.executeDamage()")
        forwardDamageIfGrappled(this, value)
        if (!didAvalancheTakePlace) {
            avalancheEffect(this, value)
        }
    }
})()


// TODO: what happens if mimmo dies after grappling?
// TODO: if grapple misses, mimmo is still blocked in grappling position
/**
 * This effect deals damage to Mimmo each time the grappled enemy takes damage.
 */
function forwardDamageIfGrappled(target, damage) {
    console.log("in forward damage")
    if (target.isStateAffected(negativeStatusesJSON["restricted"])) {
        /* Mimmo is grappling the enemy, so he should take damage. */
        const mimmo = $gameParty.members()[1]
        mimmo.gainHp(-(Math.abs(damage)))
        mimmo.startDamagePopup()
        console.log(`Inflicted ${-damage} to Mimmo!`)
    }
}

function avalancheEffect(target, damage) {
    console.log("In avalancheEffect()")
    if (target.isStateAffected(9) && !didAvalancheTakePlace) { // 9 is the state "Mimmo's Avalanche"
        didAvalancheTakePlace = true // this is called before gainHp() to avoid recursive loops (gainHp calls avalancheEffect which calls gainHp and so on)
        $gameTroop.members().forEach(enemy => {
            enemy.gainHp(-Math.abs(damage)) // this leads to a recursive call of gainHP... watch out
            enemy.startDamagePopup()
            console.log(`Enemy took ${-damage}`)
        })
    }
}