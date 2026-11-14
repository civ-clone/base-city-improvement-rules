import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { CityImprovementRegistry } from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { InteractionRegistry } from '@civ-clone/core-diplomacy/InteractionRegistry';
import { UnitRegistry } from '@civ-clone/core-unit/UnitRegistry';
import BuildPriority from '@civ-clone/core-city-build/Rules/BuildPriority';
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import Player from '@civ-clone/core-player/Player';
import Yield from '@civ-clone/core-yield/Yield';
/** What a city needs, as its yields and size show now. Worked out once for each item the city is ranking. */
export interface CityNeeds {
  city: City;
  corruption: number;
  food: number;
  gold: number;
  luxuries: number;
  production: number;
  research: number;
  size: number;
  unhappy: number;
}
/** The yield classes a ruleset's `CityNeeds` are read from. */
export interface NeedsYields {
  Corruption: typeof Yield;
  Food: typeof Yield;
  Gold: typeof Yield;
  Luxuries: typeof Yield;
  Production: typeof Yield;
  Research: typeof Yield;
  Unhappiness: typeof Yield;
}
export interface BuildPriorityTable {
  /** How much a city needs each improvement, before what it costs to keep, from 0 (not at all). */
  needs: [typeof CityImprovement, (needs: CityNeeds) => number][];
  /** Worth having in any city sooner or later: they score at least `everyday`. */
  everydayImprovements: (typeof CityImprovement)[];
  everyday: number;
  /** Only needed where the city has one of `factories`: its share of the city's production. */
  withFactory: [typeof CityImprovement, number][];
  factories: (typeof CityImprovement)[];
  /** Only for a city under threat (`isThreatened`): `warPriority`, above any other need. */
  forWar: (typeof CityImprovement)[];
  warPriority: number;
}
export interface BuildPriorityDependencies {
  cityGrowthRegistry?: CityGrowthRegistry;
  cityImprovementRegistry?: CityImprovementRegistry;
  interactionRegistry?: InteractionRegistry;
  cityRegistry?: CityRegistry;
  unitRegistry?: UnitRegistry;
}
/**
 * A computer player's rules of thumb for which improvement a city builds (`BuildPriority`, ids
 * `<idPrefix>:city/build-priority/<Improvement>`): each of `needs` scaled by how affordable its `upkeep` is (half as
 * needed when it would cost all the city makes in gold); each of `withFactory`, only with a factory; each of `forWar`,
 * only under threat.
 */
export declare const buildPriorityRules: (
  idPrefix: string,
  {
    needs,
    everydayImprovements,
    everyday,
    withFactory,
    factories,
    forWar,
    warPriority,
  }: BuildPriorityTable,
  {
    Corruption,
    Food,
    Gold,
    Luxuries,
    Production,
    Research,
    Unhappiness,
  }: NeedsYields,
  upkeep: (Improvement: typeof CityImprovement, player: Player) => number,
  {
    cityGrowthRegistry,
    cityImprovementRegistry,
    interactionRegistry,
    cityRegistry,
    unitRegistry,
  }?: BuildPriorityDependencies
) => BuildPriority[];
export default buildPriorityRules;
