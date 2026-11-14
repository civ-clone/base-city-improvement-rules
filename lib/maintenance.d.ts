import { CityImprovementRegistry } from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import Cost from '@civ-clone/core-city/Rules/Cost';
import Criterion from '@civ-clone/core-rule/Criterion';
import Yield from '@civ-clone/core-yield/Yield';
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
export declare const maintenanceRules: (
  table: [
    Improvement: typeof CityImprovement,
    YieldType: MaintenanceYield,
    cost: number | ((city: City) => number)
  ][],
  {
    cityImprovementRegistry,
  }?: {
    cityImprovementRegistry?: CityImprovementRegistry | undefined;
  },
  {
    criteria,
    idPrefix,
  }?: {
    criteria?: Criterion<[City, Yield[]]>[] | undefined;
    idPrefix?: string | undefined;
  }
) => Cost[];
export default maintenanceRules;
