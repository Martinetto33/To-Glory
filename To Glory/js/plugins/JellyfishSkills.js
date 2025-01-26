/*:
 * @plugindesc Custom skills for Jellyfish.
 * @author Alin Bordeianu
 * @version 1.0
 * @help
 * Plugin containing custom skills logic for Jellyfish enemies.
 */

(() => {
    const _Game_Enemy_setup = Game_Enemy.prototype.setup
    Game_Enemy.prototype.setup = function(enemyId, x, y) {
        _Game_Enemy_setup.call(this, enemyId, x, y)
        this._canResurrect = !!this.enemy().meta.CanResurrect // True if <CanResurrect> is in the notes
        /* The !! is a JavaScript "trick" to ensure that the expression following it
        is strictly a boolean. Negates twice the expression, converting any truthy values to false and then to true
        and converting any falsy values to true and then to false.
        It avoids unexpected behaviour and ensures type cohercition. */
    }
    
    // Add a method to check if the enemy can resurrect
    Game_Enemy.prototype.canResurrect = function() {
        return this._canResurrect
    }
    
    // Add a method to disable resurrection after it occurs
    Game_Enemy.prototype.disableResurrection = function() {
        this._canResurrect = false
    }

    const _BattleManager_checkBattleEnd = BattleManager.checkBattleEnd;
    BattleManager.checkBattleEnd = function() {
        // Check if any enemy is flagged for resurrection
        const canResurrect = $gameTroop.deadMembers().some(enemy => enemy.canResurrect())

        // Prevent battle end if resurrection is possible
        if (canResurrect) {
            // console.log("[RESURRECTION]: Enemies can resurrect!")
            return false
        }

        // Proceed with default check
        return _BattleManager_checkBattleEnd.call(this)
    }
})()

// Resurrection is handled in the Troops section of the Engine.