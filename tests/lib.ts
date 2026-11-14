import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';

/** An instance of `Type` without running its constructor, with `extra` laid over it. */
export const instanceOf = <T>(
  Type: abstract new (...args: any[]) => T,
  extra: object = {}
): T => Object.assign(Object.create(Type.prototype), extra);

/** A city of `player`'s on `tile`. */
export const cityOf = (player: unknown, tile: unknown = null): City =>
  instanceOf(City, { player: () => player, tile: () => tile });

/** A standing improvement of `Type` in `city`. */
export const built = (
  Type: typeof CityImprovement,
  city: City
): CityImprovement =>
  instanceOf(Type, { city: () => city, _destroyed: false, id: () => 'id' });

/** A player research registry where each player knows `known`. */
export const knowing = (...known: Function[]) =>
  ({
    getByPlayer: () => ({
      completed: (Type: Function) => known.includes(Type),
    }),
  } as any);
