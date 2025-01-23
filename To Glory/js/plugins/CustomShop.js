/*:
 * @plugindesc A way to add item limits to the shop.
 * @author Alin Bordeianu
 * @version 1.0
 * @help
 * Here you can insert hard coded item limits for each shop.
 * The party won't be able to buy more of these items if all
 * of them are already in their possession.
 */

/**
 * TODO:
 * - add limit checking to Scene_Shop.prototype.doBuy() function;
 * - if item is sold out, make item button gray in the shop list;
 * - if the shop is re-entered, sold out items could be left behind, but maybe this is too much work.
 */

const blacksmithItemLimits = [
    {
        "id": 1,
        "type": "weapon",
        "name": "Tranquilizing Crossbow",
        "limit": 2
    },
    {
        "id": 2,
        "type": "weapon",
        "name": "Flaming Sword",
        "limit": 2
    },
    {
        "id": 3,
        "type": "weapon",
        "name": "Lightning Katars",
        "limit": 3
    },
    {
        "id": 1,
        "type": "armor",
        "name": "Chainmail",
        "limit": 4
    },
    {
        "id": 2,
        "type": "armor",
        "name": "Impenetrable Armor",
        "limit": 4
    },
    {
        "id": 3,
        "type": "armor",
        "name": "Mystical Shell",
        "limit": 4
    },
];

const merchantItemsLimits = [
    {
        "id": SMALL_HEALING_POTION_ID,
        "kitId": SMALL_HEALING_POTION_KIT_ID,
        "switchId": SMALL_HEALING_KIT_SWITCH_ID,
        "name": "Small Healing Potion",
        "limit": 3
    },
    {
        "id": MEDIUM_HEALING_POTION_ID,
        "kitId": MEDIUM_HEALING_POTION_KIT_ID,
        "switchId": MEDIUM_HEALING_KIT_SWITCH_ID,
        "name": "Medium Healing Potion",
        "limit": 2
    },
    {
        "id": BIG_HEALING_POTION_ID,
        "kitId": BIG_HEALING_POTION_KIT_ID,
        "switchId": BIG_HEALING_KIT_SWITCH_ID,
        "name": "Big Healing Potion",
        "limit": 1
    },
    {
        "id": BEZOAR_ID,
        "kitId": BEZOAR_KIT_ID,
        "switchId": BEZOAR_KIT_SWITCH_ID,
        "name": "Bezoar",
        "limit": 5
    },
    {
        "id": STRENGTH_POTION_ID,
        "kitId": STRENGTH_POTION_KIT_ID,
        "switchId": STRENGTH_POTION_KIT_SWITCH_ID,
        "name": "Strength Potion",
        "limit": 2
    },
    {
        "id": RESISTANCE_POTION_ID,
        "kitId": RESISTANCE_POTION_KIT_ID,
        "switchId": RESISTANCE_POTION_KIT_SWITCH_ID,
        "name": "Resistance Potion",
        "limit": 2
    },
    {
        "id": INITIATIVE_POTION_ID,
        "kitId": INITIATIVE_POTION_KIT_ID,
        "switchId": INITIATIVE_POTION_KIT_SWITCH_ID,
        "name": "Initiative Potion",
        "limit": 2
    },
    {
        "id": MAGICAL_TOME_ID,
        "kitId": MAGICAL_TOME_KIT_ID,
        "switchId": MAGICAL_TOME_SWITCH_ID,
        "name": "Magical Tome",
        "limit": 3
    },
    {
        "id": SPEED_POTION_ID,
        "kitId": SPEED_POTION_KIT_ID,
        "switchId": SPEED_POTION_KIT_SWITCH_ID,
        "name": "Potion of Speed",
        "limit": 2
    }
];

// This array contains a list of all the ids of
// object kits. For example, a Bezoar Kit is something
// that can be only bought once, and that grants
// some bezoars each time the player returns to the inn.
const itemKitsIDs = [
    SMALL_HEALING_POTION_KIT_ID,
    MEDIUM_HEALING_POTION_KIT_ID,
    BIG_HEALING_POTION_KIT_ID,
    BEZOAR_KIT_ID,
    STRENGTH_POTION_KIT_ID,
    RESISTANCE_POTION_KIT_ID,
    INITIATIVE_POTION_KIT_ID,
    MAGICAL_TOME_KIT_ID
];

(() => {
    const _Scene_Shop_doBuy = Scene_Shop.prototype.doBuy
    Scene_Shop.prototype.doBuy = function(itemsNumber) {
        const item = this._item
        if (DataManager.isItem(item) && itemKitsIDs.includes(item.id)) {
            gainItemsFromKit(item.id)
            // console.log("call went ok")
        }
        _Scene_Shop_doBuy.call(this, itemsNumber)
    }

    Game_Party.prototype.maxItems = function(item) {
        // console.log("[CUSTOM SHOP]: max items called for item " + JSON.stringify(item))
        if (DataManager.isArmor(item)) {
            // console.log("This is an armor! Id = " + item.id + ", name = " + item.name)
            return blacksmithItemLimits.find(it => it.type === "armor" && it.id === item.id).limit
        } else if (DataManager.isWeapon(item)) {
            // console.log("This is a weapon! Id = " + item.id + ", name = " + item.name)
            return blacksmithItemLimits.find(it => it.type === "weapon" && it.id === item.id).limit
        } else if (DataManager.isItem(item) && itemKitsIDs.includes(item.id)) {
            // console.log("[CUSTOM SHOP]: Item is a kit!" + item.id + ", name = " + item.name)
            return 1
        } 
        return 99
    }
})()

/**
 * Takes the id of a kit and gives corresponding items to the party.
 * Kits are sets of items that are always refilled to the maximum, once bought.
 * @param {Number} kitId the id of the kit.
 */
function gainItemsFromKit(kitId) {
    const kitInfo = merchantItemsLimits.find(it => it.kitId === kitId)
    const itemInKit = $dataItems[kitInfo.id]
    const kitItemsNumberToGain = kitInfo.limit
    const kitSwitch = kitInfo.switchId
    $gameParty.gainItem(itemInKit, kitItemsNumberToGain)
    // Telling the game to start refilling items in this kit
    $gameSwitches.setValue(kitSwitch, true)
}