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
//    SCENE CONTAINING CHOICES LIST AND DESCRIPTIONS
/**********************************************************/
function Scene_ChoiceWithDescription() {
    this.initialize.apply(this, arguments)
}

Scene_ChoiceWithDescription.prototype = Object.create(Scene_MenuBase.prototype)
Scene_ChoiceWithDescription.prototype.constructor = Scene_ChoiceWithDescription

/**
 * Storing choices and descriptions into static fields of the class
 * {@link Scene_ChoiceWithDescription}.
 * @param {Array<string>} choices 
 * @param {Array<string>} descriptions 
 */
Scene_ChoiceWithDescription.prepare = function(choices, descriptions) {
    this._choices = choices || []
    this._descriptions = descriptions || []
}

Scene_ChoiceWithDescription.prototype.initialize = function(choices, descriptions) {
    Scene_MenuBase.prototype.initialize.call(this) // initialises parent object
    this._choices = Scene_ChoiceWithDescription._choices
    this._descriptions = Scene_ChoiceWithDescription._descriptions
}

 Scene_ChoiceWithDescription.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this)
    this.createChoicesWindow()
    this.createDescriptionWindow()
    this._choicesWindow.setChoices(this._choices, this._descriptions)
}

// Creation of the choices window
Scene_ChoiceWithDescription.prototype.createChoicesWindow = function() {
    const rect = this.choicesWindowRect()
    
    // Bind function is used to tell the Window_ChoiceList to always refer
    // to the updateDescription() function defined within this class instance.
    // This way, the function can't be called on any other objects.
    
    this._choicesWindow = new Window_ChoiceList(rect, this.updateDescription.bind(this))
    this.addWindow(this._choicesWindow)
}

// Creation of the description window
Scene_ChoiceWithDescription.prototype.createDescriptionWindow = function() {
    const rect = this.descriptionWindowRect()
    this._descriptionWindow = new Window_Description(rect)
    this.addWindow(this._descriptionWindow)
}

Scene_ChoiceWithDescription.prototype.choicesWindowRect = function() {
    const ww = 300 // Width of the choices window
    const wh = Graphics.boxHeight
    const wx = 0
    const wy = 0
    return new Rectangle(wx, wy, ww, wh)
}

Scene_ChoiceWithDescription.prototype.descriptionWindowRect = function() {
    const ww = Graphics.boxWidth - 300
    const wh = Graphics.boxHeight
    const wx = 300
    const wy = 0
    return new Rectangle(wx, wy, ww, wh)
}

Scene_ChoiceWithDescription.prototype.updateDescription = function(description) {
    this._descriptionWindow.setText(description)
}

Scene_ChoiceWithDescription.prototype.setChoices = function(choices, descriptions) {
    this._choicesWindow.setChoices(choices, descriptions)
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
    Window_Selectable.prototype.initialize.call(this, rect)
    this._choices = []
    this._descriptions = []
    this._onUpdateDescription = onUpdateDescription
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

Window_CustomChoiceList.prototype.maxItems = function() {
    return this._choices.length
}

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
    console.log(`Rect: ${rect}`)
    Window_Base.prototype.initialize.call(this)
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


const choices = ['Fire', 'Ice', 'Thunder', 'Heal']
const descriptions = [
    'A fiery attack that burns enemies.',
    'A chilling blast that freezes foes.',
    'A shocking strike with lightning.',
    'A skill to heal allies.'
]

/* const scene = new Scene_ChoiceWithDescription(choices, descriptions)
printObject(scene)
scene.create = function() {
    Scene_MenuBase.prototype.create.call(this)
    this.createChoicesWindow()
    this.createDescriptionWindow()

    //Set choices and descriptions
    this._choicesWindow.setChoices(choices, descriptions)
}
SceneManager.push(scene) */

// Without the new keyword, JavaScript doesn't treat windowChoiceList
// as an object that needs full initialisation and context...
// const windowChoiceList = new Window_CustomChoiceList()

function createScene() {
    // Preparing scene with required data
    Scene_ChoiceWithDescription.prepare(choices, descriptions)
    // push() takes a CLASS as a parameter, not an instance.
    // class instances have to be initialised through start()
    // and/or create() overridden methods of Scene_Base
    SceneManager.push(Scene_ChoiceWithDescription)
}
