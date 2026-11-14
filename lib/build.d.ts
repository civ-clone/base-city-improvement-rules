import { Build } from '@civ-clone/core-city-build/Rules/Build';
import { CityImprovementRegistry } from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { Requirement } from '@civ-clone/core-requirement/Requirement';
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import { Deriver } from '@civ-clone/core-requirement/RequirementRegistry';
/** An improvement is built once in each city: a state of the city, so a rule written by hand, with the ruleset's `id`. */
export declare const notBuiltRule: (
  id: string,
  cityImprovementRegistry?: CityImprovementRegistry
) => Build;
/**
 * A city may build `Improvement` only where `site(city)` holds: a state of the map (a Hydro Plant's mountains or river,
 *  a Harbour's coast), so a rule written by hand, with the ruleset's `id`.
 */
export declare const siteRule: (
  id: string,
  Improvement: typeof CityImprovement,
  site: (city: City) => boolean
) => Build;
/**
 * The rule `entry` is played by: a city may build its subject only while its targets are met (`requires`), or only
 * while they are not (`excludedBy`). A target that is an improvement is met by the city having one; any other is an
 * advance, met by the city's player having discovered it. Other relations make no rule.
 */
export declare const buildRulesFor: (
  entry: Requirement,
  cityImprovementRegistry?: CityImprovementRegistry,
  playerResearchRegistry?: PlayerResearchRegistry
) => Build[];
/** What a ruleset gives the game's `requirements` to make each entry's rules with. */
export declare const deriveBuildRules: (
  cityImprovementRegistry: CityImprovementRegistry,
  playerResearchRegistry: PlayerResearchRegistry
) => Deriver;
