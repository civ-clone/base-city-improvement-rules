import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import Cost from '@civ-clone/core-city/Rules/Cost';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Yield from '@civ-clone/core-yield/Yield';
import { improvementOf } from './has';

/** A yield class that carries the improvement it pays for, as `base-city-yield-city-improvement-maintenance-gold`'s. */
export type MaintenanceYield = new (
  value: number,
  cityImprovement: CityImprovement
) => Yield;

/** One improvement's upkeep: the improvement, the yield it's paid in, and how much a turn. */
export type Maintenance = [
  Improvement: typeof CityImprovement,
  YieldType: MaintenanceYield,
  cost: number
];

/**
 * A city `Cost` rule for each row of `table`: a city with the improvement pays `cost` of the yield a turn, as a yield
 * that carries the improvement (so a treasury that can't pay can sell it). `criteria` are added to every rule, for a
 * ruleset whose upkeep is charged only sometimes; `cost` may be a function of the city, for upkeep that changes.
 */
export const maintenanceRules = (
  table: [
    Improvement: typeof CityImprovement,
    YieldType: MaintenanceYield,
    cost: number | ((city: City) => number)
  ][],
  {
    cityImprovementRegistry = cityImprovementRegistryInstance,
  }: { cityImprovementRegistry?: CityImprovementRegistry } = {},
  {
    criteria = [],
    idPrefix,
  }: { criteria?: Criterion<[City, Yield[]]>[]; idPrefix?: string } = {}
): Cost[] =>
  table.map(
    ([Improvement, YieldType, cost]): Cost =>
      new Cost(
        ...((idPrefix === undefined
          ? []
          : [`${idPrefix}:city/cost/maintenance/${Improvement.name}`]) as []),
        new Criterion(
          (city: City): boolean =>
            improvementOf(city, Improvement, cityImprovementRegistry) !== null
        ),
        ...criteria,
        new Effect(
          (city: City): Yield =>
            new YieldType(
              typeof cost === 'function' ? cost(city) : cost,
              improvementOf(city, Improvement, cityImprovementRegistry)!
            )
        )
      )
  );

export default maintenanceRules;
