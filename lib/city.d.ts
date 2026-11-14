import { CityImprovementRegistry } from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import Created from '@civ-clone/core-city/Rules/Created';
import Destroyed from '@civ-clone/core-city/Rules/Destroyed';
export interface CityDependencies {
  cityRegistry?: CityRegistry;
  cityImprovementRegistry?: CityImprovementRegistry;
  ruleRegistry?: RuleRegistry;
}
/** Whether `city` is its player's only city: none of the player's other cities is registered. */
export declare const isOnlyCity: (
  city: City,
  cityRegistry?: CityRegistry
) => boolean;
/**
 * A city `Created` rule: a player's only city gets `Capital`, built for free (its first city, or the first after
 * losing them all). It holds whether or not the new city is registered yet when the rule runs.
 */
export declare const firstCapitalRule: (
  Capital: typeof CityImprovement,
  { cityRegistry, cityImprovementRegistry, ruleRegistry }?: CityDependencies,
  id?: string
) => Created;
/** A city `Destroyed` rule: the improvements of a destroyed city are destroyed with it. */
export declare const destroyedWithCityRule: (
  { cityImprovementRegistry }?: CityDependencies,
  id?: string
) => Destroyed;
