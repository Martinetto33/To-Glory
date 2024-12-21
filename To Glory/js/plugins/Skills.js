/*:
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
    // This field is here to avoid infinite recursion when activating the avalanche
    // effect on a grappled enemy.
    Game_Battler.prototype.hasMyAvalancheTakenEffect = false

    const _BattleManager_endTurn = BattleManager.endTurn
    BattleManager.endTurn = function() { // overriding endTurn
        _BattleManager_endTurn.call(this) // this call allows to keep old logic, and then apply the bleeding logic at the end
        //console.log("Strange game battler code called")
        inflictBleeding($gameParty.members())
        inflictBleeding($gameTroop.members())
        resetGameBattlerFlags()
    }

    // adding damage forwarding for grappling effect
    const _Game_Battler_gainHP = Game_Battler.prototype.gainHp
    Game_Battler.prototype.gainHp = function(value) {
        _Game_Battler_gainHP.call(this, value)
        if (value < 0) {
            // damage was taken, so proceed with forwarding
            forwardDamageIfGrappled(this, value)
            // when entities with avalanche effect take damage, activate it
            avalancheEffect(this, value)
        }        
    }

    const _Game_Action_apply = Game_Action.prototype.apply
    Game_Action.prototype.apply = function(target) {
        _Game_Action_apply.call(this, target)

        if (this.item().id === CATCH_SKILL_ID) {
            const result = target.result()
            if (result.isHit()) {
                // Action was successfull
                console.log("Catch succeeded!")
                this.subject().addState(RESTRICTING_STATE_ID)
            }
        }
        checkEvasion(target)
    }
    // ALIN: Leaving it here for future reference
    /* 
    const _Game_Action_applyItemEffect = Game_Action.prototype.applyItemEffect
    Game_Action.prototype.applyItemEffect = function(target, effect) {
        console.log("QUACK")
        _Game_Action_applyItemEffect.call(this, target, effect)
        if (this.item().id == CATCH_SKILL_ID) {
            console.log("papere")
            const result = target.result()
            if(!result.isHit()) {
                console.log("Catch failed!")
                // Remove restricting state after effects are applied
                const performer = this.subject()
                if (performer.isStateAffected(RESTRICTING_STATE_ID)) {
                    performer.removeState(RESTRICTING_STATE_ID)
                    console.log(`Restricting state removed from ${performer.name()}`)
                }
            }
        }
    }*/
})()

/**
 * This effect deals damage to Mimmo each time the grappled enemy takes damage.
 */
function forwardDamageIfGrappled(target, damage) {
    //console.log("in forward damage")
    //console.log(`This target is ${target.name()} and hasAlreadyForwardedDamage = ${target.hasAlreadyForwardedDamage}`)
    if (target.isStateAffected(negativeStatusesJSON["restricted"]) && !target.hasAlreadyForwardedDamage) {
        /* Mimmo is grappling the enemy, so he should take damage. */
        const mimmo = $gameParty.members()[MIMMO_INDEX]
        mimmo.gainHp(-(Math.abs(damage)))
        // mimmo.startDamagePopup()
        showCustomPopup(mimmo, `Catch: ${Math.abs(damage)} DMG`, "#939e9e", POPUP_STANDARD_DURATION)
        console.log(`Inflicted ${-damage} to Mimmo!`)
    }
}

function avalancheEffect(target, damage) {
    //console.log("In avalancheEffect()")
    //console.log(`This target is ${target.name()} and hasMyAvalancheTakenEffect = ${target.hasMyAvalancheTakenEffect}`)
    if (target.isStateAffected(MIMMO_AVALANCHE_STATE_ID) && !target.hasMyAvalancheTakenEffect) { // 9 is the state "Mimmo's Avalanche"
        target.hasMyAvalancheTakenEffect = true // this is called before gainHp() to avoid recursive loops (gainHp calls avalancheEffect which calls gainHp and so on)
        $gameTroop.members().forEach(enemy => {
            enemy.gainHp(-Math.abs(damage)) // this leads to a recursive call of gainHP... watch out
            // enemy.startDamagePopup()
            showCustomPopup(enemy, `Avalanche: ${Math.abs(damage)} DMG`, "#8cfdff", POPUP_STANDARD_DURATION)
            console.log(`Enemy took ${-damage} from avalanche`)
        })
        console.log(`${target.name()}'s avalanche took effect!`)
        target.removeState(MIMMO_AVALANCHE_STATE_ID)
    }
}

function checkEvasion(target) {
    const result = target._result // Get the result of the last action
    if (result.hit) {
        if (result.evaded) {
            console.log(`${target.name()} evaded the attack!`)
        } else {
            console.log(`${target.name()} was hit!`)
        }
    } else if (result.missed) {
        console.log(`${target.name()} completely missed the attack!`)
    }
}

function resetGameBattlerFlags() {
    $gameTroop.members().forEach(member => {
        member.hasMyAvalancheTakenEffect = false
    })
    $gameParty.members().forEach(member => {
        member.hasMyAvalancheTakenEffect = false
    })
}



// A utility function.
// Use it to see all the properties of JSON objects in the console.
function printObject(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            console.log(key + " -> " + obj[key]);
        }
    }
}