/*:
 * @plugindesc Set of constants used to avoid magic numbers in the code.
 * @author Alin Bordeianu
 * 
 * @help
 * Contains a list of constants that should help configure the game
 * better, and that should centralise the definition of the various ids
 * used in the game.
 */

// Indices
// const MIMMO_INDEX = 1 // index is the position inside the array, not the id
// UPDATE: do not use indices, they can vary if the player changes formation

// Actor ids
const MIMMO_ID = 2
const IVAN_ID = 1

// Enemy ids
const WEREWOLF_ID = 5

// States
const MIMMO_AVALANCHE_STATE_ID = 9
const RESTRICTING_STATE_ID = 8
const C_EVASION_LV1 = 10 // counter-attack evasion lv1
const C_EVASION_LV2 = 17
const C_EVASION_LV3 = 18
const CUSTOM_SKILL_SEALED = 21
const BURNING_STATE_ID = 23
const POISON_STATE_ID = 3
const BLEEDING_STATE_ID = 6
const RESTRICTED_STATE_ID = 7
const HUNTER_MARK_STATE_ID = 22
const DEFENSE_INCREASED_STATE_ID = 24


// Skills
const BASIC_ATTACK_SKILL_ID = 1
const CATCH_SKILL_ID = 10
const EVASION_SKILL_ID = 24
const NEGATE_SKILL_ID = 23
const DEVOURING_SKILL_ID = 7

// Switches
// check with $gameSwitches.value(SWITCH_ID) => returns 
// true if the switch is on or false otherwise; you can also use
// setValue(switchId, value)
const HUNTER_MARK_ACTIVATED_SWITCH_ID = 6

// View constants
const POPUP_STANDARD_DURATION = 120 // number of FPS the avalanche and grapple popups are shown for

// Common events
const IVAN_ON_EVASION_SUCCEEDED = 8
const HUNTER_MARK_HEALED = 10

// Items
const BEZOAR_ID = 4

// Configuration constants
const MP_GAINED_PER_ATTACK = 5
