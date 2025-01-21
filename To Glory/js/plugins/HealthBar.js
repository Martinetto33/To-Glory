/*:
 * @plugindesc Plugin to display enemies health bars.
 * @author Alin Bordeianu
 * @help
 * A plugin used to see custom health bars for enemies.
 * Requires View.js (for findBattlerSprite() function).
 */

const MAX_HEALTH_COLOR_SCHEME_INDEX = 0
const MEDIUM_HEALTH_COLOR_SCHEME_INDEX = 1
const LOW_HEALTH_COLOR_SCHEME_INDEX = 2
const colorSchemes = [
    {
        // Green
        "color1": "#1a520f",
        "color2": "#3af064"
    },
    {
        // Yellow
        "color1": "#b0b51d",
        "color2": "#f7ff19"
    },
    {
        // Red
        "color1": "#962b1d",
        "color2": "#f5270c"
    },
];
const FULL_HEALTH_BAR_WIDTH = 150;
const HEALTH_BAR_HEIGHT = 10;
const MAX_HEALTH_LOWER_BOUND = 0.5;
const MEDIUM_HEALTH_LOWER_BOUND = 0.25;
const HEALTH_BAR_NAME = "healthBar";
const HEALTH_BAR_FRAME_NAME = "frame";

// Scene_Battle.start is called after the battle scene was loaded.
// To display custom health bars, modify this method.
(() => {
    Spriteset_Battle.prototype.addHealthBar = function(healthBarContainer) {
        /* So this is some ugly code that tries to insert the health bars
        after the tiling sprites, which are sprites used to render repeated
        patterns, and before the enemy sprites, so that enemy images cover
        the health bars. This is stupid, but I'll leave it heare for future
        reference. */
        /* const children = this._battleField.children
        let enemySpriteIndex = children.findIndex(child => child instanceof Sprite_Enemy)
        if (enemySpriteIndex === -1) {
            enemySpriteIndex = children.length
        }
        this._battleField.addChildAt(healthBarContainer, enemySpriteIndex) */
        this._battleField.addChild(healthBarContainer)
    }

    Spriteset_Battle.prototype.removeHealthBar = function(healthBarContainer) {
        this._battleField.removeChild(healthBarContainer)
    }

    // Creating a custom class for health bars
    Sprite_HealthBar.prototype = Object.create(Sprite.prototype)
    Sprite_HealthBar.prototype.constructor = Sprite_HealthBar

    Sprite_HealthBar.prototype.initialize = function(enemy) {
        Sprite.prototype.initialize.call(this)
        this._enemy = enemy
        const enemySprite = SceneManager._scene._spriteset.findBattlerSprite(enemy)
        // Saving enemy sprite coordinates to better calculate necessary offsets
        // for frame and health bar sprites.
        this._enemyX = enemySprite.x
        this._enemyY = enemySprite.y
        this._containerOriginX = this._enemyX - FULL_HEALTH_BAR_WIDTH / 2 // center the health bar
        this._containerOriginY = this._enemyY - enemySprite.height - 20 // put the bar under the enemy sprite
        this._healthBarContainer = new Sprite()
        this._healthBarContainer.addChild(showHealthBarFrame(0, 0))
        this._healthBarContainer.addChild(showCustomHealthBar(20, 16))
        this._healthBarContainer.x = this._containerOriginX
        this._healthBarContainer.y = this._containerOriginY
        // SceneManager._scene.addChildAt(this._healthBarContainer, 0)
        SceneManager._scene._spriteset.addHealthBar(this._healthBarContainer)
    }

    Sprite_HealthBar.prototype.updateHealthBar = function() {
        updateHealthBar(this._enemy, this._healthBarContainer.children.find(child => child.name === HEALTH_BAR_NAME))
    }

    Sprite_HealthBar.prototype.enemy = function() {
        return this._enemy
    }

    Sprite_HealthBar.prototype.removeHealthBar = function() {
        SceneManager._scene._spriteset.removeHealthBar(this._healthBarContainer)
    }

    let healthBarSpritesList = []

    const _Scene_Battle_start = Scene_Battle.prototype.start
    Scene_Battle.prototype.start = function() {
        _Scene_Battle_start.call(this)
        $gameTroop.members()
                .forEach(enemy => {
                    const sprite = new Sprite_HealthBar(enemy)
                    healthBarSpritesList.push(sprite)
                })
    }

    Game_Battler.prototype._wasHealthBarRemoved = false
    _Game_Battler_gainHp = Game_Battler.prototype.gainHp
    Game_Battler.prototype.gainHp = function(value) {
        _Game_Battler_gainHp.call(this, value)
        if (this.isEnemy()) {
            const healthBarSprite = healthBarSpritesList.find(sprite => sprite.enemy() === this)
            if (healthBarSprite) {
                if (this.isDead() && !this._wasHealthBarRemoved) {
                    // if the enemy died, remove the health bar
                    const index = healthBarSpritesList.indexOf(healthBarSprite)
                    if (index === -1) {
                        throw new Error("Could not find entry in healthBarSpritesList.")
                    }
                    healthBarSpritesList.splice(index, 1) // removing sprite from list
                    // console.log("[HEALTH-BAR] Removed elements: " + JSON.stringify(removedElements))
                    healthBarSprite.removeHealthBar()
                    this._wasHealthBarRemoved = true
                } else {
                    healthBarSprite.updateHealthBar()
                }
            }
        }
    }
})()

/**
 * Creates a custom sprite to represent an enemy's health bar.
 * @param {Game_Battler} enemy the enemy 
 * @returns the healthBar sprite
 */
function showCustomHealthBar(x, y) {
    // Create a new sprite for the popup
    const healthBar = new Sprite()
    const bitmap = new Bitmap(FULL_HEALTH_BAR_WIDTH, HEALTH_BAR_HEIGHT) // Width and height of the popup
    /**
     * [In rpg_core.js]
     * Draws the rectangle with a gradation.
     *
     * @method gradientFillRect
     * @param {Number} x The x coordinate for the upper-left corner
     * @param {Number} y The y coordinate for the upper-left corner
     * @param {Number} width The width of the rectangle to fill
     * @param {Number} height The height of the rectangle to fill
     * @param {String} color1 The gradient starting color
     * @param {String} color2 The gradient ending color
     * @param {Boolean} vertical Wether the gradient should be draw as vertical or not
     */
    bitmap.gradientFillRect(
        0, 
        0, 
        FULL_HEALTH_BAR_WIDTH, 
        HEALTH_BAR_HEIGHT, 
        colorSchemes[MAX_HEALTH_COLOR_SCHEME_INDEX].color1,
        colorSchemes[MAX_HEALTH_COLOR_SCHEME_INDEX].color2
    )
    healthBar.bitmap = bitmap
    healthBar.opacity = 255
    healthBar.x = x 
    healthBar.y = y
    healthBar.name = HEALTH_BAR_NAME
    return healthBar
}

function updateHealthBar(enemy, healthBarSprite) {
    const healthBarLength = calculateHealthBarLength(enemy)
    console.log("[HEALTH-BAR] Health bar length: " + healthBarLength)
    const colorSchemeIndex = getColorSchemeFromHealthBarLength(healthBarLength)
    const bitmap = new Bitmap(healthBarLength, HEALTH_BAR_HEIGHT)
    bitmap.gradientFillRect(
        0, 
        0, 
        healthBarLength,
        HEALTH_BAR_HEIGHT, 
        colorSchemes[colorSchemeIndex].color1,
        colorSchemes[colorSchemeIndex].color2
    )
    healthBarSprite.bitmap.clear()
    healthBarSprite.bitmap = bitmap
}

function getColorSchemeFromHealthBarLength(healthBarLength) {
    const ratio = healthBarLength / FULL_HEALTH_BAR_WIDTH
    if (ratio < MEDIUM_HEALTH_LOWER_BOUND) {
        return LOW_HEALTH_COLOR_SCHEME_INDEX
    }
    if (ratio < MAX_HEALTH_LOWER_BOUND) {
        return MEDIUM_HEALTH_COLOR_SCHEME_INDEX
    }
    return MAX_HEALTH_COLOR_SCHEME_INDEX
}

/**
 * Returns the maximum HP for the enemy.
 * Used to calculate health bar length.
 * @param {Game_Battler} enemy the enemy
 * @returns the maximum HP for this enemy
 */
function getEnemyMaxHealth(enemy) {
    if (!enemy.isEnemy()) {
        throw new Error("Received wrong entity instead of an enemy: " + JSON.stringify(enemy))
    }
    const enemyId = enemy.enemyId()
    return $dataEnemies
            .find(enemy => enemy !== null && enemy.id === enemyId)
            .params[0]
}

/**
 * Calculates a new length for the health bar of the enemy.
 * The health bar is a rectangle, which becomes shorter if
 * the enemy's HP are reduced.
 * @param {Game_Battler} enemy the enemy
 * @returns the length of the health bar
 */
function calculateHealthBarLength(enemy) {
    const currentHP = enemy.hp
    const maxHP = getEnemyMaxHealth(enemy)
    if (currentHP === maxHP) return FULL_HEALTH_BAR_WIDTH
    return Math.floor(currentHP / maxHP * FULL_HEALTH_BAR_WIDTH)
}

function removeHealthBar(healthBarSprite) {
    SceneManager._scene.removeChild(healthBarSprite)
}

function Sprite_HealthBar() {
    this.initialize.apply(this, arguments)
}

function showHealthBarFrame(x, y) {
    const frame = new Sprite()
    const bitmap = ImageManager.loadBitmap('img/pictures/', "health-bar", 0, false)
    frame.bitmap = bitmap
    frame.opacity = 255
    frame.x = x
    frame.y = y
    frame.scale.x = 0.25
    frame.scale.y = 0.15
    frame.name = HEALTH_BAR_FRAME_NAME
    return frame
}