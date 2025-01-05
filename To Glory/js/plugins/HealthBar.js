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

// Scene_Battle.start is called after the battle scene was loaded.
// To display custom health bars, modify this method.
(() => {
    // Creating a custom class for health bars
    Sprite_HealthBar.prototype = Object.create(Sprite.prototype)
    Sprite_HealthBar.prototype.constructor = Sprite_HealthBar

    Sprite_HealthBar.prototype.initialize = function(enemy) {
        Sprite.prototype.initialize.call(this)
        this._enemy = enemy
        this._healthBar = showCustomHealthBar(enemy)
    }

    Sprite_HealthBar.prototype.updateHealthBar = function() {
        updateHealthBar(this._enemy, this._healthBar)
    }

    Sprite_HealthBar.prototype.enemy = function() {
        return this._enemy
    }

    Sprite_HealthBar.prototype.removeHealthBar = function() {
        SceneManager._scene.removeChild(this._healthBar)
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
        showHealthBarFrame()
    }

    _Game_Battler_gainHp = Game_Battler.prototype.gainHp
    Game_Battler.prototype.gainHp = function(value) {
        _Game_Battler_gainHp.call(this, value)
        if (this.isEnemy()) {
            const healthBarSprite = healthBarSpritesList.find(sprite => sprite.enemy() === this)
            if (this.isDead()) {
                // if the enemy died, remove the health bar
                const index = healthBarSpritesList.indexOf(healthBarSprite)
                if (index === -1) {
                    throw new Error("Could not find entry in healthBarSpritesList.")
                }
                healthBarSpritesList.splice(index, 1) // removing sprite from list
                // console.log("[HEALTH-BAR] Removed elements: " + JSON.stringify(removedElements))
                healthBarSprite.removeHealthBar()
            } else {
                healthBarSprite.updateHealthBar()
            }
        }
    }
})()

/**
 * Creates a custom sprite to represent an enemy's health bar.
 * @param {Game_Battler} enemy the enemy 
 * @returns the healthBar sprite
 */
function showCustomHealthBar(enemy) {
    const enemySprite = SceneManager._scene._spriteset.findBattlerSprite(enemy)
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
    healthBar.x = enemySprite.x - FULL_HEALTH_BAR_WIDTH / 2 // center the health bar
    healthBar.y = enemySprite.y - enemySprite.height - 20

    // Add the popup to the battle scene
    SceneManager._scene.addChild(healthBar)
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

function showHealthBarFrame() {
    const frame = new Sprite()
    const bitmap = ImageManager.loadBitmap('img/pictures/', "health-bar", 0, false)
    frame.bitmap = bitmap
    frame.opacity = 255
    frame.x = 0
    frame.y = 0
    frame.scale.x = 0.25
    frame.scale.y = 0.25
    SceneManager._scene.addChild(frame)
    return frame
}