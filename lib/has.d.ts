import { CityImprovementRegistry } from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
/** Whether `city` has a standing improvement of `Improvement` (or a subclass of it). */
export declare const hasImprovement: (
  city: City,
  Improvement: typeof CityImprovement,
  cityImprovementRegistry?: CityImprovementRegistry
) => boolean;
/** The first of `city`'s standing improvements of `Improvement`, or `null`. */
export declare const improvementOf: (
  city: City,
  Improvement: typeof CityImprovement,
  cityImprovementRegistry?: CityImprovementRegistry
) => CityImprovement | null;
export default hasImprovement;
