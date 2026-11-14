import { built, cityOf } from './lib';
import {
  destroyedWithCityRule,
  firstCapitalRule,
  isOnlyCity,
} from '../lib/city';
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import CityImprovementRegistry from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import { expect } from 'chai';

class Palace extends CityImprovement {}
class Temple extends CityImprovement {}

describe('lib/city', (): void => {
  const setUp = () => {
    const cityRegistry = new CityRegistry(),
      cityImprovementRegistry = new CityImprovementRegistry(),
      ruleRegistry = new RuleRegistry(),
      rule = firstCapitalRule(
        Palace,
        { cityRegistry, cityImprovementRegistry, ruleRegistry },
        'x:capital'
      ),
      found = (city: City, registerFirst: boolean): void => {
        if (registerFirst) {
          cityRegistry.register(city);
        }

        if (rule.validate(city)) {
          rule.process(city);
        }

        if (!registerFirst) {
          cityRegistry.register(city);
        }
      };

    return { cityImprovementRegistry, cityRegistry, found, rule };
  };

  [false, true].forEach((registerFirst) =>
    it(`firstCapitalRule: gives a player's only city the capital, ${
      registerFirst ? 'already' : 'not yet'
    } registered`, (): void => {
      const { cityImprovementRegistry, found, rule } = setUp(),
        first = cityOf('p'),
        second = cityOf('p'),
        theirs = cityOf('q');

      expect(rule.id()).equal('x:capital');

      found(first, registerFirst);
      found(second, registerFirst);
      found(theirs, registerFirst);

      const capitals = cityImprovementRegistry
        .entries()
        .filter((improvement) => improvement instanceof Palace);

      expect(capitals.map((capital) => capital.city())).eql([first, theirs]);
    })
  );

  it("isOnlyCity: none of the player's other cities is registered", (): void => {
    const { cityRegistry } = setUp(),
      first = cityOf('p'),
      second = cityOf('p');

    expect(isOnlyCity(first, cityRegistry)).true;
    cityRegistry.register(first);
    expect(isOnlyCity(first, cityRegistry)).true;
    expect(isOnlyCity(second, cityRegistry)).false;
  });

  it("destroyedWithCityRule: a destroyed city's improvements are destroyed", (): void => {
    const cityImprovementRegistry = new CityImprovementRegistry(),
      city = cityOf('p'),
      other = cityOf('p'),
      temple = built(Temple, city),
      elsewhere = built(Temple, other),
      rule = destroyedWithCityRule({ cityImprovementRegistry });

    cityImprovementRegistry.register(temple, elsewhere);

    expect(rule.validate(city)).true;
    rule.process(city);

    expect(temple.destroyed()).true;
    expect(elsewhere.destroyed()).false;
    expect(rule.validate(city)).false;
  });
});
