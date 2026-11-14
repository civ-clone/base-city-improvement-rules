import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import Created from '@civ-clone/core-city-improvement/Rules/Created';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';

export interface CreatedDependencies {
  cityImprovementRegistry?: CityImprovementRegistry;
  engine?: Engine;
}

export interface CreatedOptions {
  /** The capital: building one destroys its player's others, so a player has one at most. */
  Capital: typeof CityImprovement;
  /** Prefixed to each rule's id (`<prefix>:city-improvement/created/...`); without one the rules are id-less. */
  idPrefix?: string;
}

const withId = (idPrefix: string | undefined, name: string): string[] =>
  idPrefix === undefined
    ? []
    : [`${idPrefix}:city-improvement/created/${name}`];

/**
 * What happens when an improvement is built, in order: it's registered; a new `Capital` destroys its player's other
 * ones (the capital moves); and the engine is told (`city-improvement:created`).
 */
export const createdRules = (
  {
    cityImprovementRegistry = cityImprovementRegistryInstance,
    engine = engineInstance,
  }: CreatedDependencies,
  { Capital, idPrefix }: CreatedOptions
): Created[] => [
  new Created(
    ...(withId(idPrefix, 'register') as []),
    new Effect((cityImprovement: CityImprovement): void =>
      cityImprovementRegistry.register(cityImprovement)
    )
  ),
  new Created(
    ...(withId(idPrefix, 'move-capital') as []),
    new Criterion(
      (cityImprovement: CityImprovement): boolean =>
        cityImprovement instanceof Capital
    ),
    new Effect((capital: CityImprovement, city: City): void =>
      cityImprovementRegistry
        .filter(
          (cityImprovement: CityImprovement): boolean =>
            cityImprovement instanceof Capital &&
            cityImprovement !== capital &&
            !cityImprovement.destroyed() &&
            cityImprovement.city().player() === city.player()
        )
        .forEach((oldCapital: CityImprovement): void => oldCapital.destroy())
    )
  ),
  new Created(
    ...(withId(idPrefix, 'emit') as []),
    new Effect((cityImprovement: CityImprovement, city: City): void => {
      engine.emit('city-improvement:created', cityImprovement, city);
    })
  ),
];

export default createdRules;
