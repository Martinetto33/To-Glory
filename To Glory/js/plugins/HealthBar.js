/*:
 * @plugindesc Plugin to display enemies health bars.
 * @author Alin Bordeianu
 * @help
 * A plugin used to see custom health bars for enemies.
 */

function showCustomHealthBar() {
    // Create a new sprite for the popup
    const popup = new Sprite()
    const bitmap = new Bitmap(200, 50) // Width and height of the popup
    bitmap.gradientFillRect(0, 0, 200, 50, "#FFFFFF", "#000000")
    popup.bitmap = bitmap
    popup.opacity = 255
    popup.x = 0
    popup.y = 0

    // Add the popup to the battle scene
    SceneManager._scene.addChild(popup)
}

// Scene_Battle.start is called after the battle scene was loaded.
// To display custom health bars, modify this method.
(() => {
    // Save the original start method of Scene_Battle
    const _Scene_Battle_start = Scene_Battle.prototype.start

    // Override the start method
    Scene_Battle.prototype.start = function() {
        // Call the original start method
        _Scene_Battle_start.call(this)
        showCustomHealthBar()
    }
})()