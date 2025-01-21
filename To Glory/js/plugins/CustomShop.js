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

(() => {
    Game_Party.prototype.maxItems = function(item) {
        // console.log("[CUSTOM SHOP]: max items called for item " + JSON.stringify(item))
        if (item.atypeId) {
            // console.log("This is an armor! Id = " + item.id + ", name = " + item.name)
            return blacksmithItemLimits.find(it => it.type === "armor" && it.id === item.id).limit
        } else if (item.wtypeId) {
            // console.log("This is a weapon! Id = " + item.id + ", name = " + item.name)
            return blacksmithItemLimits.find(it => it.type === "weapon" && it.id === item.id).limit
        }
        return 99
    }
})()

