import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { InteractionRegistry } from '@civ-clone/core-diplomacy/InteractionRegistry';
import { UnitRegistry } from '@civ-clone/core-unit/UnitRegistry';
import City from '@civ-clone/core-city/City';
/** How near another player's unit or city has to be to threaten a city, by default. */
export declare const threatRadius = 5;
/**
 * Whether a unit or city of a player `city`'s owner isn't at peace with is within `radius` tiles of it. Two players
 * who've met are at war until they agree peace, so having met isn't enough on its own.
 */
export declare const isThreatened: (
  city: City,
  cityRegistry?: CityRegistry,
  interactionRegistry?: InteractionRegistry,
  unitRegistry?: UnitRegistry,
  radius?: number
) => boolean;
export default isThreatened;
