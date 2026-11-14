import { built, cityOf } from './lib';
import Advance from '@civ-clone/core-science/Advance';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import CityImprovementRegistry from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import Complete from '@civ-clone/core-science/Rules/Complete';
import Cost from '@civ-clone/core-city/Rules/Cost';
import Created from '@civ-clone/core-city-improvement/Rules/Created';
import Criterion from '@civ-clone/core-rule/Criterion';
import Engine from '@civ-clone/core-engine/Engine';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Yield from '@civ-clone/core-yield/Yield';
import createdRules from '../lib/created';
import { expect } from 'chai';
import maintenanceRules from '../lib/maintenance';
import obsoleteRules from '../lib/obsolete';

class Palace extends CityImprovement {}
class Temple extends CityImprovement {}
class Barracks extends CityImprovement {}
class Gunpowder extends Advance {}
class Upkeep extends Yield {
  improvement: CityImprovement;

  constructor(value: number, improvement: CityImprovement) {
    super(value);

    this.improvement = improvement;
  }
  cityImprovement() {
    return this.improvement;
  }
}

describe('lib/created', (): void => {
  it('registers a new improvement, moves the capital and tells the engine, with ids when asked', (): void => {
    const cityImprovementRegistry = new CityImprovementRegistry(),
      engine = new Engine(),
      ruleRegistry = new RuleRegistry(),
      told: unknown[] = [],
      first = cityOf('p'),
      second = cityOf('p'),
      theirs = cityOf('q'),
      oldCapital = built(Palace, first),
      theirCapital = built(Palace, theirs),
      newCapital = built(Palace, second),
      temple = built(Temple, first);

    ruleRegistry.register(
      ...createdRules(
        { cityImprovementRegistry, engine },
        { Capital: Palace, idPrefix: 'x' }
      )
    );
    engine.on('city-improvement:created', (improvement) =>
      told.push(improvement)
    );

    [oldCapital, theirCapital].forEach((capital) =>
      cityImprovementRegistry.register(capital)
    );

    ruleRegistry.process(Created, temple, first);

    expect(cityImprovementRegistry.getByCity(first)).eql([oldCapital, temple]);
    expect(oldCapital.destroyed()).false;

    ruleRegistry.process(Created, newCapital, second);

    expect(oldCapital.destroyed()).true;
    expect(theirCapital.destroyed()).false;
    expect(newCapital.destroyed()).false;
    expect(told).eql([temple, newCapital]);
    expect(ruleRegistry.entries().map((rule) => rule.id())).eql([
      'x:city-improvement/created/register',
      'x:city-improvement/created/move-capital',
      'x:city-improvement/created/emit',
    ]);
  });
});

describe('lib/maintenance', (): void => {
  it('charges each improvement a city has, as a yield carrying it, when the criteria hold', (): void => {
    const cityImprovementRegistry = new CityImprovementRegistry(),
      ruleRegistry = new RuleRegistry(),
      city = cityOf('p'),
      temple = built(Temple, city);
    let charged = true;

    ruleRegistry.register(
      ...maintenanceRules(
        [
          [Temple, Upkeep, 1],
          [Barracks, Upkeep, (): number => 3],
          [Palace, Upkeep, 0],
        ],
        { cityImprovementRegistry },
        { criteria: [new Criterion(() => charged)], idPrefix: 'x' }
      )
    );

    const costs = (): Yield[] =>
      ruleRegistry.process(Cost, city, []).flat() as Yield[];

    expect(costs()).eql([]);

    cityImprovementRegistry.register(temple, built(Barracks, city));

    expect(
      costs().map((cost) => [
        cost.value(),
        (cost as Upkeep).cityImprovement().constructor,
      ])
    ).eql([
      [1, Temple],
      [3, Barracks],
    ]);

    charged = false;

    expect(costs()).eql([]);
    expect(ruleRegistry.entries()[0].id()).equal(
      'x:city/cost/maintenance/Temple'
    );
  });
});

describe('lib/obsolete', (): void => {
  it("removes the discovering player's improvements of the type, says which, and tells the engine", (): void => {
    const cityImprovementRegistry = new CityImprovementRegistry(),
      cityRegistry = new CityRegistry(),
      engine = new Engine(),
      ruleRegistry = new RuleRegistry(),
      city = cityOf('p'),
      theirs = cityOf('q'),
      barracks = built(Barracks, city),
      temple = built(Temple, city),
      theirBarracks = built(Barracks, theirs),
      removed: unknown[] = [],
      told: unknown[] = [];

    cityRegistry.register(city, theirs);
    cityImprovementRegistry.register(barracks, temple, theirBarracks);
    engine.on('city-improvement:obsolete', (...args) => told.push(args));
    ruleRegistry.register(
      ...obsoleteRules(
        [[Barracks, Gunpowder]],
        { cityImprovementRegistry, cityRegistry, engine },
        {
          removed: (player, Improvement, obsolete) =>
            removed.push([player, Improvement, obsolete]),
        }
      )
    );

    const research = { player: () => 'p' } as any;

    ruleRegistry.process(Complete, research, new (class extends Advance {})());

    expect(barracks.destroyed()).false;

    ruleRegistry.process(Complete, research, new Gunpowder());

    expect(barracks.destroyed()).true;
    expect(temple.destroyed()).false;
    expect(theirBarracks.destroyed()).false;
    expect(removed).eql([['p', Barracks, [barracks]]]);
    expect(told).length(1);
  });
});
