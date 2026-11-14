import { CityImprovementRegistry } from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { Engine } from '@civ-clone/core-engine/Engine';
import Advance from '@civ-clone/core-science/Advance';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import Complete from '@civ-clone/core-science/Rules/Complete';
import Player from '@civ-clone/core-player/Player';
export interface ObsoleteDependencies {
  cityImprovementRegistry?: CityImprovementRegistry;
  cityRegistry?: CityRegistry;
  engine?: Engine;
}
export interface ObsoleteOptions {
  /** Told of what was removed, for a ruleset that refunds it. */
  removed?: (
    player: Player,
    Improvement: typeof CityImprovement,
    obsolete: CityImprovement[]
  ) => void;
  idPrefix?: string;
}
/**
 * A `Complete` rule for each row of `table`: discovering the advance removes every one of the discovering player's
 * improvements of the type, and the engine is told (`city-improvement:obsolete`), even when there were none.
 */
export declare const obsoleteRules: (
  table: [
    Improvement: typeof CityImprovement,
    ObsoletingAdvance: typeof Advance
  ][],
  { cityImprovementRegistry, cityRegistry, engine }?: ObsoleteDependencies,
  { removed, idPrefix }?: ObsoleteOptions
) => Complete[];
export default obsoleteRules;
