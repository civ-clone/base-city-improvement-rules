import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  InteractionRegistry,
  instance as interactionRegistryInstance,
} from '@civ-clone/core-diplomacy/InteractionRegistry';
import {
  UnitRegistry,
  instance as unitRegistryInstance,
} from '@civ-clone/core-unit/UnitRegistry';
import City from '@civ-clone/core-city/City';
import { IInteraction } from '@civ-clone/core-diplomacy/Interaction';
import Peace from '@civ-clone/base-diplomacy-declaration-peace/Peace';
import Player from '@civ-clone/core-player/Player';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';

/** How near another player's unit or city has to be to threaten a city, by default. */
export const threatRadius = 5;

/**
 * Whether a unit or city of a player `city`'s owner isn't at peace with is within `radius` tiles of it. Two players
 * who've met are at war until they agree peace, so having met isn't enough on its own.
 */
export const isThreatened = (
  city: City,
  cityRegistry: CityRegistry = cityRegistryInstance,
  interactionRegistry: InteractionRegistry = interactionRegistryInstance,
  unitRegistry: UnitRegistry = unitRegistryInstance,
  radius: number = threatRadius
): boolean => {
  const player = city.player(),
    atPeace = new Set<Player>(),
    isEnemy = (other: Player): boolean =>
      other !== player && !atPeace.has(other);

  interactionRegistry
    .getByPlayer(player)
    .forEach((interaction: IInteraction): void => {
      if (interaction instanceof Peace && interaction.active()) {
        interaction.players().forEach((other: Player) => atPeace.add(other));
      }
    });

  return city
    .tile()
    .getSurroundingArea(radius)
    .entries()
    .some((tile: Tile): boolean => {
      const tileCity = cityRegistry.getByTile(tile);

      return (
        (tileCity !== null && isEnemy(tileCity.player())) ||
        unitRegistry
          .getByTile(tile)
          .some((unit: Unit): boolean => isEnemy(unit.player()))
      );
    });
};

export default isThreatened;
