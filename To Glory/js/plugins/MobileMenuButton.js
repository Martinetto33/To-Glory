/*:
 * @plugindesc A plugin to add a menu button in the mobile version of the project.
 * @author Alin Bordeianu
 * @version 1.0
 * @help
 * Adds a menu button on the screens, available outside of combat.
 */

(() => {
    // TODO: uncomment when ready for deployment
    if (Utils.isMobileDevice()) {
        const _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows
        Scene_Map.prototype.createAllWindows = function() {
            _Scene_Map_createAllWindows.call(this)
            this.createCustomMenuButton()
        }

        Scene_Map.prototype.createCustomMenuButton = function() {
            this._menuButton = new Sprite_Button()
            this._menuButton.bitmap = ImageManager.loadSystem('MenuButton') // Replace 'ButtonImage' with the image file name in the img/system folder
            this._menuButton.x = Graphics.width - 100 // Adjust position
            this._menuButton.y = 20 // Adjust position
            // this._menuButton.setClickHandler(this.handleMenuButtonClick.bind(this))
            this._menuButton.hitTest = function(eventX, eventY) {
                const buttonX = this.x
                const buttonY = this.y
                const buttonWidth = this.width
                const buttonHeight = this.height
                assert(buttonX !== undefined && buttonY !== undefined && buttonWidth !== undefined && buttonHeight !== undefined)
                return eventX >= buttonX &&
                       eventX <= buttonX + buttonWidth &&
                       eventY >= buttonY &&
                       eventY <= buttonY + buttonHeight
            }
            this.addChild(this._menuButton)
        }

        const _Scene_Map_update = Scene_Map.prototype.update
        Scene_Map.prototype.update = function() {
            _Scene_Map_update.call(this)
            if (this._menuButton) {
                // Ensure the button is only visible outside combat
                this._menuButton.visible = $gameParty.inBattle() === false
            }
        }

        Scene_Map.prototype.handleMenuButtonClick = function() {
            SoundManager.playOk()
            SceneManager.push(Scene_Menu)
        }

        const _TouchInput_isTriggered = TouchInput.isTriggered
        TouchInput.isTriggered = function() {
            const x = this.x
            const y = this.y
            // Check if the click is on the menu button in the current scene
            if (SceneManager._scene instanceof Scene_Map && SceneManager._scene._menuButton) {
                const menuButton = SceneManager._scene._menuButton
                if (menuButton.hitTest(x, y)) {
                    // Ignore clicks on the menu button
                    console.log("[MOBILE BUTTON] Clicked on menu button!")
                    SceneManager._scene.handleMenuButtonClick()
                    return false
                }
            }
            return _TouchInput_isTriggered.call(this)
        }
    }
})()
