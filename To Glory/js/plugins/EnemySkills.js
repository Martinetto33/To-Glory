/*:
 * @plugindesc Plugin containing custom enemies effects.
 * @author Alin Bordeianu
 * @version 1.0
 * @help
 * Contains custom effects for enemies.
 */

const werewolfSkillsKit = [
    1, // normal attack
    2, // guard
    5, // infectious bite
    6, // blood thirst
    8, // burning scythe
    9 // poisonous breath
]

function activateWerewolvesDevouring() {
    let werewolves = $gameTroop.members().filter(e => e.enemyId() === WEREWOLF_ID)
    // In javascript, for...in iterates over the keys, for...of iterates over values
    // https://stackoverflow.com/questions/29285897/difference-between-for-in-and-for-of-statements
    for (const enemy of werewolves) {
        if (enemy && enemy.canMove() && enemy.canUseDevouring() && !enemy._actionsTaken) {
            let markedTargets = $gameParty.members()
                    .filter(actor => actor.isStateAffected(HUNTER_MARK_STATE_ID))
            let target = pick(markedTargets)
            if (target !== null) {
                console.log("TARGET INDEX: " + target.index())
                // this is enough to trigger the forced action at the end of the turn
                enemy.forceAction(DEVOURING_SKILL_ID, target.index())
                console.log(`${enemy.name()} used Devouring on ${target.name()}!`)
            }
        }
    }
}

(() => {
    BattleManager._devouredActors = []

    const _BattleManager_startTurn = BattleManager.startTurn
    BattleManager.startTurn = function() {
        console.log("Turn has begun! Turn number: " + $gameTroop.turnCount())
        _BattleManager_startTurn.call(this)
        if ($gameSwitches.value(HUNTER_MARK_ACTIVATED_SWITCH_ID)) {
            activateWerewolvesDevouring()
            console.log("[DEVOURING]: BattleManager activated Werewolves Devouring!")
        }
    }

    const _BattleManager_endTurn = BattleManager.endTurn
    BattleManager.endTurn = function () {
        _BattleManager_endTurn.call(this)
        // At the end of the turn, reset the hunter's 
        // mark switch if nobody is marked anymore
        $gameSwitches.setValue(HUNTER_MARK_ACTIVATED_SWITCH_ID, isHunterMarkOn())
        // Remove Hunter's Mark from all people who were devoured
        this._devouredActors.forEach(actor => actor.removeState(HUNTER_MARK_STATE_ID))
        this._devouredActors = []
    }

    const Game_Battler_onTurnEnd = Game_Battler.prototype.onTurnEnd
    Game_Battler.prototype.onTurnEnd = function() {
        this._actionsTaken = false
        Game_Battler_onTurnEnd.call(this)
    }
    
    Game_Battler.prototype._actionsTaken = false;

    Game_Battler.prototype.canUseDevouring = function(target = null) {
        const hunterMarked = $gameParty.members()
                .some(actor => actor.isStateAffected(HUNTER_MARK_STATE_ID))
        if (target !== null) {
            /* Sometimes the desired target might have healed from the mark,
            so a fallback action would be needed. */
            const markedPeople = $gameParty.members()
                    .filter(actor => actor.isStateAffected(HUNTER_MARK_STATE_ID))
            return hunterMarked && !this._actionsTaken && markedPeople.includes(target)
        }
        return hunterMarked && !this._actionsTaken // Only if Hunter's Mark is present and no actions were taken
    }

    const _Game_Action_apply = Game_Action.prototype.apply
    Game_Action.prototype.apply = function (target) {
        if (DataManager.isSkill(this.item()) && this.item().id === DEVOURING_SKILL_ID) {
            /* This additional check ensures actors are still affected by hunter's
            mark before any wolf can use the devouring action. If no hunter's mark
            is found, the werewolves simply lose their turn, but they complain a bit
            with the player first. */
            if (this.subject().isEnemy() && this.subject().canUseDevouring(target)) {
                _Game_Action_apply.call(this, target)
                const damage = target.result().hpDamage
                if (damage !== 0) {
                    console.log("[DEVOURING]: Damage inflicted by Devouring: " + damage)
                }
                // Remove Hunter's Mark from target.
                // target.removeState(HUNTER_MARK_STATE_ID)
                // Increase werewolf defence
                if (target.result().isHit()) {
                    this.subject().addState(DEFENSE_INCREASED_STATE_ID)
                    BattleManager._devouredActors.push(target)
                }
                // console.log(`[DEVOURING]: Hunter's mark removed from ${target.name()}`)
            } else {
                // An event that shows some text with the Werewolves' complaints :)
                $gameTemp.reserveCommonEvent(HUNTER_MARK_HEALED)
                // Assign a fallback action to the enemy
                assignFallbackAction(this.subject())
            }
        } else {
            _Game_Action_apply.call(this, target)
        }
        this.subject()._actionsTaken = true
    }
})()

function isHunterMarkOn() {
    return $gameParty.members().some(actor => actor.isStateAffected(HUNTER_MARK_STATE_ID))
}

/**
 * Assigns a fallback action to the enemy when Devouring cannot be used.
 * For example, a basic attack or another skill.
 * @param {Game_Enemy} enemy The enemy to assign the fallback action to.
 */
function assignFallbackAction(enemy) {
    console.log(`[DEVOURING]: ${enemy.name()} cannot use Devouring. Fallback action assigned.`)
    const fallbackSkillId = pick(werewolfSkillsKit)

    const fallbackAction = new Game_Action(enemy)
    fallbackAction.setSkill(fallbackSkillId)
    const targets = fallbackAction.makeTargets()
    if (targets.length > 0) {
        fallbackAction.setTarget(pick(targets).index())
    } else {
        console.warn(`[DEVOURING]: No valid targets for ${enemy.name()}'s fallback action.`)
    }
    enemy.clearActions(); // Clear existing actions
    enemy.setAction(0, fallbackAction) // Assign the fallback action
}
