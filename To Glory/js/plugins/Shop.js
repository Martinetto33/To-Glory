/*:
 * @plugindesc Plugin containing utility functions for shopping.
 * @author Alin Bordeianu
 * @version 1.0
 * @help
 * Contains item limits.
 */

// TODO: maybe we'll complete this in the future.

const weaponLimits = [
    {
        "weaponId": 1,
        "limit": 4,
        "name": "Tranquilizing Crossbow",
        "price": 80
    },
    {
        "weaponId": 2,
        "limit": 4,
        "name": "Flaming Sword",
        "price": 80
    },
    {
        "weaponId": 3,
        "limit": 4,
        "name": "Lightning Katars",
        "price": 80
    }
]

const armorLimits = [
    {
        "armorId": 1,
        "limit": 4,
        "name": "Chainmail",
        "price": 80
    },
    {
        "armorId": 2,
        "limit": 4,
        "name": "Impenetrable Armor",
        "price": 80
    },
    {
        "armorId": 3,
        "limit": 4,
        "name": "Mystical Shell",
        "price": 80
    }
]

const itemLimits = [
    {
        "itemId": 1,
        "limit": 3,
        "name": "Small Healing Potion",
        "price": 5
    },
    {
        "itemId": 2,
        "limit": 2,
        "name": "Medium Healing Potion",
        "price": 50
    },
    {
        "itemId": 3,
        "limit": 1,
        "name": "Big Healing Potion",
        "price": 80
    },
    {
        "itemId": 4,
        "limit": 5,
        "name": "Bezoar",
        "price": 30
    },
    {
        "itemId": 5,
        "limit": 2,
        "name": "Potion of Strength",
        "price": 10
    },
    {
        "itemId": 6,
        "limit": 2,
        "name": "Potion of Resistance",
        "price": 10
    },
    {
        "itemId": 7,
        "limit": 2,
        "name": "Potion of Initiative",
        "price": 10
    },
    {
        "itemId": 8,
        "limit": 3,
        "name": "Magic Tome",
        "price": 100
    }
]

function canBuyMoreWeapons(weaponId, availableGold) {
    const alreadyBoughtWeapons = 0
}