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
        if (actor.actorId() == MIMMO_ID && grappledEnemies.length == 1) { // 2 is Mimmo's id
            //console.log("Grappled!")
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

    /**
     * Adding a way to offset the damage popups when avalanche and grappling
     * damage occur simultaneously.
     * EDIT: this didn't work as expected; the popup flies away and is offset to the
     * right instead of upwards (?)
     * But may be useful for future reference
     */
    /* const _Sprite_Battler_setupDamagePopup = Sprite_Battler.prototype.setupDamagePopup
    Sprite_Battler.prototype.setupDamagePopup = function() {
        _Sprite_Battler_setupDamagePopup.call(this)
        // Adjusting vertical offset for better visibility
        const lastPopup = this._damages[this._damages.length - 1]
        if (lastPopup) {
            lastPopup.y -= 20 // Move popup upwards
        }
    } */

    Spriteset_Battle.prototype.findBattlerSprite = function(battler) {
        return this._enemySprites.find(sprite => sprite._battler === battler) ||
                this._actorSprites.find(sprite => sprite._battler === battler)
    }
})()

/**
 * This is here to allow custom popups during the battle.
 * Proved to be super useful to show messages for Avalanche and
 * Catch damage effects.
 */
function showCustomPopup(battler, text, color = "#FFFFFF", duration = 90) {
    const sprite = SceneManager._scene._spriteset.findBattlerSprite(battler)
    if (!sprite) return

    // Create a new sprite for the popup
    const popup = new Sprite()
    const bitmap = new Bitmap(200, 50) // Width and height of the popup
    bitmap.fontSize = 25
    bitmap.textColor = color
    // Parameters: text, x, y, maxWidth, lineHeight, align
    bitmap.drawText(text, 0, 0, 200, 50, "center")
    popup.bitmap = bitmap

    // Position the popup above the battler
    popup.x = sprite.x - 50 // Adjust for horizontal alignment
    popup.y = sprite.y - 20 // sprite.height // Display above the battler
    popup.opacity = 255

    // Add the popup to the battle scene
    SceneManager._scene.addChild(popup)

    // Gradually fade out and remove the popup
    const fadeInterval = setInterval(() => {
        popup.opacity -= 255 / duration
        popup.x += 40 / duration // gradually move popup to the right
        if (popup.opacity <= 0) {
            SceneManager._scene.removeChild(popup)
            clearInterval(fadeInterval)
        }
    }, 1000 / 60) // 60 FPS
}
