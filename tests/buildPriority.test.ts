import { built, cityOf, instanceOf } from './lib';
import BuildPriority from '@civ-clone/core-city-build/Rules/BuildPriority';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import CityImprovementRegistry from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import Peace from '@civ-clone/base-diplomacy-declaration-peace/Peace';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Yield from '@civ-clone/core-yield/Yield';
import buildPriorityRules from '../lib/buildPriority';
import { expect } from 'chai';
import isThreatened from '../lib/threat';

class Temple extends CityImprovement {}
class Library extends CityImprovement {}
class Factory extends CityImprovement {}
class PowerPlant extends CityImprovement {}
class CityWalls extends CityImprovement {}
class Gold extends Yield {}
class Unhappiness extends Yield {}
class Production extends Yield {}

const asked: number[] = [],
  tileWith = (around: unknown[]) => ({
    getSurroundingArea: (radius: number) => {
      asked.push(radius);

      return { entries: () => around };
    },
  }),
  registries = (
    peace: unknown[] = [],
    cities: Map<unknown, unknown> = new Map(),
    units: Map<unknown, unknown[]> = new Map()
  ) => ({
    interactionRegistry: { getByPlayer: () => peace } as any,
    cityRegistry: {
      getByTile: (tile: unknown) => cities.get(tile) ?? null,
    } as any,
    unitRegistry: {
      getByTile: (tile: unknown) => units.get(tile) ?? [],
    } as any,
  });

describe('lib/threat', (): void => {
  it("is threatened by a unit or city of a player it isn't at peace with, nearby", (): void => {
    const near = {},
      city = cityOf('p', tileWith([near])),
      enemyUnit = { player: () => 'q' },
      ownUnit = { player: () => 'p' },
      peace = instanceOf(Peace, {
        active: () => true,
        players: () => ['p', 'q'],
      }),
      check = (r: ReturnType<typeof registries>) =>
        isThreatened(
          city,
          r.cityRegistry,
          r.interactionRegistry,
          r.unitRegistry
        );

    expect(check(registries())).false;
    expect(check(registries([], new Map(), new Map([[near, [ownUnit]]]))))
      .false;
    expect(check(registries([], new Map(), new Map([[near, [enemyUnit]]]))))
      .true;
    expect(check(registries([], new Map([[near, cityOf('q')]]), new Map())))
      .true;
    expect(
      check(registries([peace], new Map(), new Map([[near, [enemyUnit]]])))
    ).false;
  });
});

describe('lib/buildPriority', (): void => {
  const setUp = (
    upkeep: number,
    threatened = false,
    radius: number | undefined = undefined
  ) => {
    const cityImprovementRegistry = new CityImprovementRegistry(),
      ruleRegistry = new RuleRegistry(),
      near = {},
      city = cityOf('p', tileWith([near])),
      r = registries(
        [],
        new Map(),
        new Map(threatened ? [[near, [{ player: () => 'q' }]]] : [])
      );

    ruleRegistry.register(
      ...buildPriorityRules(
        'x',
        {
          needs: [
            [Temple, ({ unhappy }) => unhappy * 2],
            [Library, () => 0],
          ],
          everydayImprovements: [Library],
          everyday: 0.1,
          withFactory: [[PowerPlant, 0.5]],
          factories: [Factory],
          forWar: [CityWalls],
          warPriority: 100,
          ...(radius === undefined ? {} : { threatRadius: radius }),
        },
        {
          Corruption: Yield,
          Food: Yield,
          Gold,
          Luxuries: Yield,
          Production,
          Research: Yield,
          Unhappiness,
        },
        () => upkeep,
        {
          cityImprovementRegistry,
          cityGrowthRegistry: {
            getByCity: () => ({ size: () => 4 }),
          } as any,
          ...r,
        }
      )
    );

    const priority = (Item: unknown, yields: Yield[]): number[] =>
      ruleRegistry.process(
        BuildPriority,
        instanceOf(CityBuild, { city: () => city }),
        Item as any,
        yields
      ) as number[];

    return { city, cityImprovementRegistry, priority };
  };

  it("scales a need by what its upkeep leaves of the city's gold", (): void => {
    // 2 unhappy: need 4. Gold 3, upkeep 1: (1 + 3) / (1 + 3 + 1).
    expect(setUp(1).priority(Temple, [new Unhappiness(2), new Gold(3)])).eql([
      4 * (4 / 5),
    ]);
    expect(setUp(0).priority(Temple, [new Unhappiness(2)])).eql([4]);
  });

  it('gives an everyday improvement at least `everyday`', (): void => {
    expect(setUp(0).priority(Library, [])).eql([0.1]);
    expect(setUp(0).priority(Temple, [])).eql([0]);
  });

  it('wants a plant only with a factory, by its share of production', (): void => {
    const { city, cityImprovementRegistry, priority } = setUp(0);

    expect(priority(PowerPlant, [new Production(10)])).eql([]);

    cityImprovementRegistry.register(built(Factory, city));

    expect(priority(PowerPlant, [new Production(10)])).eql([5]);
  });

  it('wants war improvements only under threat, above everything', (): void => {
    expect(setUp(0).priority(CityWalls, [])).eql([]);
    expect(setUp(0, true).priority(CityWalls, [])).eql([100]);
  });

  it('looks for threats within 5 squares, or the radius given', (): void => {
    asked.splice(0);
    setUp(0, true).priority(CityWalls, []);
    setUp(0, true, 3).priority(CityWalls, []);

    expect(asked).eql([5, 3]);
  });
});
