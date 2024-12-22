/*:
 * @plugindesc A window that displays some choices, and has an area to display some text next to the choices.
 * @author Alin Bordeianu
 * @version 1.0
 * @help
 * Used to show the list of enemy skills and their descriptions when using Alissa's Negate action.
 * Requires Utils plugin.
 */

// Custom scene; note: all this weird syntax is an older JavaScript way to create classes.
// The 'class' keyword was added in later versions, and RPG Maker seems not to support it.
/**********************************************************/
//    ADDING CUSTOM WINDOWS TO ORIGINAL SCENE_BATTLE
/**********************************************************/

Scene_Battle.prototype.createCustomChoiceWindows = function(choices, descriptions) {
    // Create the choices window
    const choicesRect = this.customChoicesWindowRect()
    this._customChoicesWindow = new Window_CustomChoiceList(
        choicesRect, 
        this.updateCustomDescription.bind(this)
    )
    this.addWindow(this._customChoicesWindow)
    // Make the window interactable
    this._choicesWindowActive = true
    this._customChoicesWindow.activate()
    this._customChoicesWindow.select(0)

    // Set choices and descriptions
    this._customChoicesWindow.setChoices(choices, descriptions)

    // Create the description window
    const descriptionRect = this.customDescriptionWindowRect()
    this._customDescriptionWindow = new Window_Description(descriptionRect)
    this.addWindow(this._customDescriptionWindow)
}

Scene_Battle.prototype.customChoicesWindowRect = function() {
    const ww = 300 // Width of the choices window
    const wh = Graphics.boxHeight // Full height of the screen
    const wx = 0 // Start from the left edge
    const wy = 0 // Start from the top
    return new Rectangle(wx, wy, ww, wh)
}

Scene_Battle.prototype.customDescriptionWindowRect = function() {
    const ww = Graphics.boxWidth - 300 // Remaining width after the choices window
    const wh = Graphics.boxHeight // Full height of the screen
    const wx = 300 // Start where the choices window ends
    const wy = 0 // Start from the top
    return new Rectangle(wx, wy, ww, wh)
}

Scene_Battle.prototype.updateCustomDescription = function(description) {
    this._customDescriptionWindow.setText(description)
}

Scene_Battle.prototype.removeCustomChoiceWindows = function() {
    if (this._customChoicesWindow) {
        this.removeChild(this._customChoicesWindow)
        this._customChoicesWindow = null
        this._choicesWindowActive = false
    }
    if (this._customDescriptionWindow) {
        this.removeChild(this._customDescriptionWindow)
        this._customDescriptionWindow = null
    }
}




/**********************************************************/
//              WINDOW CONTAINING CHOICES LIST
/**********************************************************/

function Window_CustomChoiceList() {
    this.initialize.apply(this, arguments)
}

Window_CustomChoiceList.prototype = Object.create(Window_Selectable.prototype)
Window_CustomChoiceList.prototype.constructor = Window_CustomChoiceList

Window_CustomChoiceList.prototype.initialize = function(rect, onUpdateDescription) {
    Window_Selectable.prototype.initialize.call(this, rect.x, rect.y, rect.width, rect.height)
    this._choices = []
    this._descriptions = []
    this._onUpdateDescription = onUpdateDescription

    // Bind the maxItems method to this instance
    this.maxItems = () => this._choices.length

    this.refresh()
}

/**
 * 
 * @param {Array<String>} choices 
 * @param {Array<String>} descriptions 
 */
Window_CustomChoiceList.prototype.setChoices = function(choices, descriptions) {
    assert(Array.isArray(choices) && Array.isArray(descriptions) && 
    choices.length > 0 && descriptions.length > 0 && 
    choices.length === descriptions.length, "Choices and descriptions arrays are ill-formed.")
    this._choices = choices
    this._descriptions = descriptions
    this.refresh()
    this.select(0)
}

// Called by the inner logic of the engine (rpg_windows.js:779)
/* Window_CustomChoiceList.prototype.maxItems = function() {
    return this._choices.length
} */

Window_CustomChoiceList.prototype.drawItem = function(index) {
    const rect = this.itemRect(index)
    this.drawText(this._choices[index], rect.x, rect.y, rect.width, 'left')
}

/**
 * This is an overridden function, called by the RPG Maker engine on
 * all active windows each frame.
 */
Window_CustomChoiceList.prototype.update = function() {
    Window_Selectable.prototype.update.call(this)
    if (this._onUpdateDescription && this.index() >= 0) {
        const description = this._descriptions[this.index()]
        this._onUpdateDescription(description)
    }
}


/**********************************************************/
//              WINDOW CONTAINING DESCRIPTION
/**********************************************************/

function Window_Description() {
    this.initialize.apply(this, arguments)
}

Window_Description.prototype = Object.create(Window_Base.prototype)
Window_Description.prototype.constructor = Window_Description

Window_Description.prototype.initialize = function(rect) {
    Window_Base.prototype.initialize.call(this, rect.x, rect.y, rect.width, rect.height)
    this._text = ''
}

Window_Description.prototype.setText = function(text) {
    if (this._text !== text) {
        this._text = text
        this.refresh()
    }
}

Window_Description.prototype.refresh = function() {
    this.contents.clear()
    this.drawTextEx(this._text, 0, 0)
}

/**********************************************************/
//                          USAGE
/**********************************************************/

// Without the new keyword, JavaScript doesn't treat windowChoiceList
// as an object that needs full initialisation and context...
// const windowChoiceList = new Window_CustomChoiceList()

// Overriding the normal update method of Scene_Battle.
// This should avoid progression of the battle while the user is busy choosing an option.
const _Scene_Battle_update = Scene_Battle.prototype.update
Scene_Battle.prototype.update = function() {
    if (this._choicesWindowActive) printObject(this._choicesWindow)
    if (this._choicesWindowActive && this._choicesWindow !== undefined) {
        // Then only update the choices window
        console.log("HELLO")
        this._choicesWindow.update()
    } else {
        _Scene_Battle_update.call(this)
    }
}


function showCustomWindows() {
    const choices = ['Fire', 'Ice', 'Thunder', 'Heal']
    const descriptions = [
        'A fiery attack that burns enemies.',
        'A chilling blast that freezes foes.',
        'A shocking strike with lightning.',
        'A skill to heal allies.'
    ]
    SceneManager._scene.createCustomChoiceWindows(choices, descriptions)
}
