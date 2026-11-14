"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isThreatened = exports.threatRadius = void 0;
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const InteractionRegistry_1 = require("@civ-clone/core-diplomacy/InteractionRegistry");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const Peace_1 = require("@civ-clone/base-diplomacy-declaration-peace/Peace");
/** How near another player's unit or city has to be to threaten a city, by default. */
exports.threatRadius = 5;
/**
 * Whether a unit or city of a player `city`'s owner isn't at peace with is within `radius` tiles of it. Two players
 * who've met are at war until they agree peace, so having met isn't enough on its own.
 */
const isThreatened = (city, cityRegistry = CityRegistry_1.instance, interactionRegistry = InteractionRegistry_1.instance, unitRegistry = UnitRegistry_1.instance, radius = exports.threatRadius) => {
    const player = city.player(), atPeace = new Set(), isEnemy = (other) => other !== player && !atPeace.has(other);
    interactionRegistry
        .getByPlayer(player)
        .forEach((interaction) => {
        if (interaction instanceof Peace_1.default && interaction.active()) {
            interaction.players().forEach((other) => atPeace.add(other));
        }
    });
    return city
        .tile()
        .getSurroundingArea(radius)
        .entries()
        .some((tile) => {
        const tileCity = cityRegistry.getByTile(tile);
        return ((tileCity !== null && isEnemy(tileCity.player())) ||
            unitRegistry
                .getByTile(tile)
                .some((unit) => isEnemy(unit.player())));
    });
};
exports.isThreatened = isThreatened;
exports.default = exports.isThreatened;
//# sourceMappingURL=threat.js.map