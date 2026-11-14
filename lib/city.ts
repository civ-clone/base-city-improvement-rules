import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import Created from '@civ-clone/core-city/Rules/Created';
import Criterion from '@civ-clone/core-rule/Criterion';
import Destroyed from '@civ-clone/core-city/Rules/Destroyed';
import Effect from '@civ-clone/core-rule/Effect';

export interface CityDependencies {
  cityRegistry?: CityRegistry;
  cityImprovementRegistry?: CityImprovementRegistry;
  ruleRegistry?: RuleRegistry;
}

/** Whether `city` is its player's only city: none of the player's other cities is registered. */
export const isOnlyCity = (
  city: City,
  cityRegistry: CityRegistry = cityRegistryInstance
): boolean =>
  cityRegistry
    .getByPlayer(city.player())
    .every((other: City): boolean => other === city);

/**
 * A city `Created` rule: a player's only city gets `Capital`, built for free (its first city, or the first after
 * losing them all). It holds whether or not the new city is registered yet when the rule runs.
 */
export const firstCapitalRule = (
  Capital: typeof CityImprovement,
  {
    cityRegistry = cityRegistryInstance,
    cityImprovementRegistry = cityImprovementRegistryInstance,
    ruleRegistry = ruleRegistryInstance,
  }: CityDependencies = {},
  id?: string
): Created =>
  new Created(
    ...((id === undefined ? [] : [id]) as []),
    new Criterion((city: City): boolean => isOnlyCity(city, cityRegistry)),
    new Effect((city: City): void =>
      cityImprovementRegistry.register(new Capital(city, ruleRegistry))
    )
  );

/** A city `Destroyed` rule: the improvements of a destroyed city are destroyed with it. */
export const destroyedWithCityRule = (
  {
    cityImprovementRegistry = cityImprovementRegistryInstance,
  }: CityDependencies = {},
  id?: string
): Destroyed =>
  new Destroyed(
    ...((id === undefined ? [] : [id]) as []),
    new Criterion(
      (city: City): boolean =>
        cityImprovementRegistry.getByCity(city).length > 0
    ),
    new Effect((city: City): void =>
      cityImprovementRegistry
        .getByCity(city)
        .forEach((cityImprovement: CityImprovement) =>
          cityImprovement.destroy()
        )
    )
  );
