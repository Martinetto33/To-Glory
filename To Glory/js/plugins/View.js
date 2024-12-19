/*:
 * @plugindesc Plugin for adding visual effects to fighting system.
 * @author Alin Bordeianu
 * 
 * @help
 * Contains the logic for displaying Mimmo next to the grappled enemy.
 */

(() => {
    const _Sprite_Actor_updatePosition = Sprite_Actor.prototype.updatePosition

    Sprite_Actor.prototype.updatePosition = function() {
        const actor = this._actor
        const grappledEnemies = $gameTroop.aliveMembers()
                .filter(enemy => enemy.isStateAffected(negativeStatusesJSON["restricted"]))
        if (actor.actorId() == 2 && grappledEnemies.length == 1) { // 2 is Mimmo's id
            console.log("Grappled!")
            const targetEnemy = grappledEnemies[0]
            if (targetEnemy) {
                const targetSprite = BattleManager._spriteset.findTargetSprite(targetEnemy)
                if (targetSprite) {
                    // Lock the actor near the enemy
                    this.x = targetSprite.x + 200
                    this.y = targetSprite.y
                    return // to skip normal position update
                }
            }
        }

        // Default behaviour when no enemy is grappled
        _Sprite_Actor_updatePosition.call(this)
    }

    // Helper to find the sprite for a target
    Spriteset_Battle.prototype.findTargetSprite = function(battler) {
        return this._enemySprites.find(sprite => sprite._battler === battler) || null
    }
})()