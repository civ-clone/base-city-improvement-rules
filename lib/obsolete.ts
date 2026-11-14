import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import Advance from '@civ-clone/core-science/Advance';
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import Complete from '@civ-clone/core-science/Rules/Complete';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Player from '@civ-clone/core-player/Player';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';

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
export const obsoleteRules = (
  table: [
    Improvement: typeof CityImprovement,
    ObsoletingAdvance: typeof Advance
  ][],
  {
    cityImprovementRegistry = cityImprovementRegistryInstance,
    cityRegistry = cityRegistryInstance,
    engine = engineInstance,
  }: ObsoleteDependencies = {},
  { removed, idPrefix }: ObsoleteOptions = {}
): Complete[] =>
  table.map(
    ([Improvement, ObsoletingAdvance]): Complete =>
      new Complete(
        ...((idPrefix === undefined
          ? []
          : [
              `${idPrefix}:player/research-complete/obsolete/${Improvement.name}/${ObsoletingAdvance.name}`,
            ]) as []),
        new Criterion(
          (playerResearch: PlayerResearch, advance: Advance): boolean =>
            advance instanceof ObsoletingAdvance
        ),
        new Effect((playerResearch: PlayerResearch, advance: Advance): void => {
          const player = playerResearch.player(),
            obsolete = cityRegistry
              .getByPlayer(player)
              .flatMap((city: City): CityImprovement[] =>
                cityImprovementRegistry
                  .getByCity(city)
                  .filter(
                    (cityImprovement: CityImprovement): boolean =>
                      cityImprovement instanceof Improvement
                  )
              );

          obsolete.forEach((cityImprovement: CityImprovement): void =>
            cityImprovement.destroy()
          );

          removed?.(player, Improvement, obsolete);

          engine.emit(
            'city-improvement:obsolete',
            player,
            advance,
            Improvement,
            obsolete
          );
        })
      )
  );

export default obsoleteRules;
