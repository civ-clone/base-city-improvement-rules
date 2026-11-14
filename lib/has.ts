import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';

/** Whether `city` has a standing improvement of `Improvement` (or a subclass of it). */
export const hasImprovement = (
  city: City,
  Improvement: typeof CityImprovement,
  cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance
): boolean =>
  cityImprovementRegistry
    .getByCity(city)
    .some(
      (cityImprovement: CityImprovement): boolean =>
        cityImprovement instanceof Improvement
    );

/** The first of `city`'s standing improvements of `Improvement`, or `null`. */
export const improvementOf = (
  city: City,
  Improvement: typeof CityImprovement,
  cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance
): CityImprovement | null =>
  cityImprovementRegistry
    .getByCity(city)
    .find(
      (cityImprovement: CityImprovement): boolean =>
        cityImprovement instanceof Improvement
    ) ?? null;

export default hasImprovement;
