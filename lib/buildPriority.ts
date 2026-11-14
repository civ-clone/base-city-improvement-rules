import {
  CityGrowthRegistry,
  instance as cityGrowthRegistryInstance,
} from '@civ-clone/core-city-growth/CityGrowthRegistry';
import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
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
import BuildPriority from '@civ-clone/core-city-build/Rules/BuildPriority';
import { IBuildable as Buildable } from '@civ-clone/core-city-build/Buildable';
import City from '@civ-clone/core-city/City';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Player from '@civ-clone/core-player/Player';
import Yield from '@civ-clone/core-yield/Yield';
import { hasImprovement } from './has';
import isThreatened, { threatRadius as defaultThreatRadius } from './threat';

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
  /** How near an unfriendly unit or city makes a threat (`isThreatened`); 5 by default. */
  threatRadius?: number;
}

export interface BuildPriorityDependencies {
  cityGrowthRegistry?: CityGrowthRegistry;
  cityImprovementRegistry?: CityImprovementRegistry;
  interactionRegistry?: InteractionRegistry;
  cityRegistry?: CityRegistry;
  unitRegistry?: UnitRegistry;
}

const total = (yields: Yield[], YieldType: typeof Yield): number =>
  yields
    .filter((cityYield: Yield): boolean => cityYield instanceof YieldType)
    .reduce(
      (sum: number, cityYield: Yield): number => sum + cityYield.value(),
      0
    );

/**
 * A computer player's rules of thumb for which improvement a city builds (`BuildPriority`, ids
 * `<idPrefix>:city/build-priority/<Improvement>`): each of `needs` scaled by how affordable its `upkeep` is (half as
 * needed when it would cost all the city makes in gold); each of `withFactory`, only with a factory; each of `forWar`,
 * only under threat.
 */
export const buildPriorityRules = (
  idPrefix: string,
  {
    needs,
    everydayImprovements,
    everyday,
    withFactory,
    factories,
    forWar,
    warPriority,
    threatRadius = defaultThreatRadius,
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
    cityGrowthRegistry = cityGrowthRegistryInstance,
    cityImprovementRegistry = cityImprovementRegistryInstance,
    interactionRegistry = interactionRegistryInstance,
    cityRegistry = cityRegistryInstance,
    unitRegistry = unitRegistryInstance,
  }: BuildPriorityDependencies = {}
): BuildPriority[] => {
  const cityNeeds = (city: City, yields: Yield[]): CityNeeds => ({
      city,
      // Corruption yields are negative: what the city loses.
      corruption: -total(yields, Corruption),
      food: total(yields, Food),
      gold: total(yields, Gold),
      luxuries: total(yields, Luxuries),
      production: total(yields, Production),
      research: total(yields, Research),
      size: cityGrowthRegistry.getByCity(city).size(),
      unhappy: total(yields, Unhappiness),
    }),
    affordable = (Item: typeof CityImprovement, city: City, gold: number) =>
      (1 + Math.max(0, gold)) /
      (1 + Math.max(0, gold) + upkeep(Item, city.player())),
    hasFactory = (city: City): boolean =>
      factories.some((Factory) =>
        hasImprovement(city, Factory, cityImprovementRegistry)
      ),
    isItem =
      (Item: typeof CityImprovement) =>
      (cityBuild: CityBuild, BuildItem: Buildable): boolean =>
        BuildItem === (Item as unknown as Buildable),
    id = (Item: typeof CityImprovement): string =>
      `${idPrefix}:city/build-priority/${Item.name}`;

  return [
    ...needs.map(
      ([Item, need]): BuildPriority =>
        new BuildPriority(
          id(Item),
          new Criterion(isItem(Item)),
          new Effect(
            (
              cityBuild: CityBuild,
              BuildItem: Buildable,
              yields: Yield[]
            ): number => {
              const needs = cityNeeds(cityBuild.city(), yields);

              return (
                Math.max(
                  need(needs),
                  everydayImprovements.includes(Item) ? everyday : 0
                ) * affordable(Item, needs.city, needs.gold)
              );
            }
          )
        )
    ),
    ...withFactory.map(
      ([Item, share]): BuildPriority =>
        new BuildPriority(
          id(Item),
          new Criterion(isItem(Item)),
          new Criterion((cityBuild: CityBuild): boolean =>
            hasFactory(cityBuild.city())
          ),
          new Effect(
            (
              cityBuild: CityBuild,
              BuildItem: Buildable,
              yields: Yield[]
            ): number => {
              const needs = cityNeeds(cityBuild.city(), yields);

              return (
                needs.production *
                share *
                affordable(Item, needs.city, needs.gold)
              );
            }
          )
        )
    ),
    ...forWar.map(
      (Item: typeof CityImprovement): BuildPriority =>
        new BuildPriority(
          id(Item),
          new Criterion(isItem(Item)),
          new Criterion((cityBuild: CityBuild): boolean =>
            isThreatened(
              cityBuild.city(),
              cityRegistry,
              interactionRegistry,
              unitRegistry,
              threatRadius
            )
          ),
          new Effect((): number => warPriority)
        )
    ),
  ];
};

export default buildPriorityRules;
