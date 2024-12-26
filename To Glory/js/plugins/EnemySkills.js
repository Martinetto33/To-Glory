/*:
 * @plugindesc Plugin containing custom enemies effects.
 * @author Alin Bordeianu
 * @version 1.0
 * @help
 * Contains custom effects for enemies.
 */

// TODO: fix the fucking devouring skill
function activateWerewolvesDevouring() {
    let werewolves = $gameTroop.members().filter(e => e.enemyId() === WEREWOLF_ID)
    // In javascript, for...in iterates over the keys, for...of iterates over values
    // https://stackoverflow.com/questions/29285897/difference-between-for-in-and-for-of-statements
    for (const enemy of werewolves) {
        if (enemy && enemy.canMove() && enemy.canUseDevouring() && !enemy._actionsTaken) {
            // Temporarily add the skill to the enemy's skill list
            let markedTargets = $gameParty.members()
                    .filter(actor => actor.isStateAffected(HUNTER_MARK_STATE_ID))
            let target = pick(markedTargets)
            if (target !== null) {
                // enemy._usedDevouring = true
                // let action = new Game_Action(enemy)
                // action.setSkill(DEVOURING_SKILL_ID)
                // action.setTarget($gameParty.members().indexOf(target))
                // enemy.clearActions()
                // enemy.setAction(0, action)
                console.log("TARGET INDEX: " + target.index())
                enemy.forceAction(DEVOURING_SKILL_ID, target.index())
                BattleManager.forceAction(enemy)
                enemy._actionsTaken = true
                console.log(`${enemy.name()} used Devouring on ${target.name()}!`)
            }
        }
    }
}

(() => {
    const _BattleManager_startTurn = BattleManager.startTurn
    BattleManager.startTurn = function() {
        console.log("Turn has begun! Turn number: " + $gameTroop.turnCount())
        _BattleManager_startTurn.call(this)
        if ($gameSwitches.value(HUNTER_MARK_ACTIVATED_SWITCH_ID)) {
            activateWerewolvesDevouring()
            console.log("I activated Werewolves Devouring!")
        }
    }

    const _BattleManager_endTurn = BattleManager.endTurn
    BattleManager.endTurn = function () {
        _BattleManager_endTurn.call(this)
        // At the end of the turn, reset the hunter's 
        // mark switch if nobody is marked anymore
        $gameSwitches.setValue(HUNTER_MARK_ACTIVATED_SWITCH_ID, isHunterMarkOn())
    }

    const Game_Battler_onTurnEnd = Game_Battler.prototype.onTurnEnd
    Game_Battler.prototype.onTurnEnd = function() {
        this._actionsTaken = false
        Game_Battler_onTurnEnd.call(this)
    }
    
    Game_Battler.prototype._actionsTaken = false;

    Game_Battler.prototype.canUseDevouring = function() {
        const hunterMarked = $gameParty.members()
                .some(actor => actor.isStateAffected(HUNTER_MARK_STATE_ID))
        return hunterMarked && !this._actionsTaken // Only if Hunter's Mark is present and no actions were taken
    }

    const _Game_Action_apply = Game_Action.prototype.apply
    Game_Action.prototype.apply = function (target) {
        _Game_Action_apply.call(this, target)
        if (this.item().id === DEVOURING_SKILL_ID) {
            // Remove Hunter's Mark from target.
            target.removeState(HUNTER_MARK_STATE_ID)
            console.log(`Hunter's mark removed from ${target.name()}`)
        }
        this.subject()._actionsTaken = true
    }
})()

function isHunterMarkOn() {
    return $gameParty.members().some(actor => actor.isStateAffected(HUNTER_MARK_STATE_ID))
}
