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

const blacksmithItemLimits = {

};

const merchantItemLimits = {

};

(() => {
    const _Scene_Shop_doBuy = Scene_Shop.prototype.doBuy
    Scene_Shop.prototype.doBuy = function(itemsNumber) {
        console.log("[CUSTOM SHOP]: buying " + itemsNumber.toString() + " items!")
        _Scene_Shop_doBuy.call(this, itemsNumber)
    }
})()