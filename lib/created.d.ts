import { CityImprovementRegistry } from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import { Engine } from '@civ-clone/core-engine/Engine';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import Created from '@civ-clone/core-city-improvement/Rules/Created';
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
/**
 * What happens when an improvement is built, in order: it's registered; a new `Capital` destroys its player's other
 * ones (the capital moves); and the engine is told (`city-improvement:created`).
 */
export declare const createdRules: (
  { cityImprovementRegistry, engine }: CreatedDependencies,
  { Capital, idPrefix }: CreatedOptions
) => Created[];
export default createdRules;
