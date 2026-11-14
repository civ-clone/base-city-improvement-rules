import { buildRulesFor, notBuiltRule, siteRule } from '../lib/build';
import { destroyedWithCityRule, firstCapitalRule } from '../lib/city';
import Advance from '@civ-clone/core-science/Advance';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import Criterion from '@civ-clone/core-rule/Criterion';
import Rule from '@civ-clone/core-rule/Rule';
import Yield from '@civ-clone/core-yield/Yield';
import buildPriorityRules from '../lib/buildPriority';
import createdRules from '../lib/created';
import { expect } from 'chai';
import maintenanceRules from '../lib/maintenance';
import obsoleteRules from '../lib/obsolete';
import { readFileSync } from 'fs';
import { table } from '@civ-clone/core-requirement/Requirement';

// civ1-city-improvement's rules as the renderer's build loads them (web-renderer d5906b2f, dumped by id, rule class,
//  priority and criteria count): the factories here, given civ1's own inputs, must make the same rules, so civ1 can
//  adopt them without anything moving.
const civ1: { [file: string]: [string | null, string, number, number][] } =
  JSON.parse(
    readFileSync('tests/fixtures/civ1-city-improvement-rules.json', 'utf8')
  );

const fingerprint = (rules: Rule<any, any>[]) =>
  rules.map((rule: any) => [
    rule.id(),
    rule.constructor.name,
    rule.priority().value(),
    rule._criteria ? rule._criteria._criteria.length : 0,
  ]);

// Stand-ins named as civ1's classes, since a rule's id is built from the class name.
const improvement = (name: string): typeof CityImprovement =>
    ({ [name]: class extends CityImprovement {} }[name]),
  advance = (name: string): typeof Advance =>
    ({ [name]: class extends Advance {} }[name]),
  I: { [name: string]: typeof CityImprovement } = {},
  A: { [name: string]: typeof Advance } = {};

[
  'Aqueduct',
  'Bank',
  'Barracks',
  'Cathedral',
  'CityWalls',
  'Colosseum',
  'Courthouse',
  'Factory',
  'Granary',
  'HydroPlant',
  'Library',
  'ManufacturingPlant',
  'Marketplace',
  'MassTransit',
  'NuclearPlant',
  'Palace',
  'PowerPlant',
  'RecyclingCenter',
  'SdiDefence',
  'Temple',
  'University',
].forEach((name) => (I[name] = improvement(name)));
['Gunpowder', 'Combustion', 'Construction'].forEach(
  (name) => (A[name] = advance(name))
);

class Gold extends Yield {}

describe("civ1-city-improvement's rules", (): void => {
  it('Rules/City/build', (): void => {
    const prefix = 'civ1-city-improvement:city/build',
      requiresAdvance = table(
        `${prefix}/requires-advance`,
        'requires',
        [
          'Aqueduct',
          'CityWalls',
          'Colosseum',
          'Courthouse',
          'Granary',
          'Library',
          'Marketplace',
          'Palace',
          'Temple',
          'Bank',
          'Cathedral',
          'Factory',
          'HydroPlant',
          'MassTransit',
          'ManufacturingPlant',
          'NuclearPlant',
          'PowerPlant',
          'RecyclingCenter',
          'SdiDefence',
          'University',
        ].map((name) => [I[name], A.Construction])
      ),
      requiresImprovement = table(
        `${prefix}/requires-improvement`,
        'requires',
        [
          [I.Bank, I.Marketplace],
          [I.University, I.Library],
          [I.PowerPlant, I.Factory],
        ],
        { mode: 'any', range: 'city' }
      ),
      excludedBy = table(
        `${prefix}/excluded-by`,
        'excludedBy',
        [
          [I.Courthouse, I.Palace],
          [I.Factory, I.ManufacturingPlant],
          [I.HydroPlant, I.NuclearPlant, I.PowerPlant],
          [I.NuclearPlant, I.PowerPlant, I.HydroPlant],
          [I.PowerPlant, I.HydroPlant, I.NuclearPlant],
        ],
        { mode: 'any', range: 'city' }
      );

    expect(
      fingerprint([
        notBuiltRule(`${prefix}/not-built`),
        ...[...requiresAdvance, ...requiresImprovement, ...excludedBy].flatMap(
          (entry) => buildRulesFor(entry)
        ),
        siteRule(`${prefix}/hydro-plant-site`, I.HydroPlant, () => true),
      ])
    ).eql(civ1['Rules/City/build.js']);
  });

  it('Rules/City/created', (): void => {
    expect(fingerprint([firstCapitalRule(I.Palace)])).eql(
      civ1['Rules/City/created.js']
    );
  });

  it('Rules/City/destroyed', (): void => {
    expect(fingerprint([destroyedWithCityRule()])).eql(
      civ1['Rules/City/destroyed.js']
    );
  });

  it('Rules/CityImprovement/created', (): void => {
    expect(fingerprint(createdRules({}, { Capital: I.Palace }))).eql(
      civ1['Rules/CityImprovement/created.js']
    );
  });

  it('Rules/Player/research-complete', (): void => {
    expect(
      fingerprint(
        obsoleteRules([
          [I.Barracks, A.Gunpowder],
          [I.Barracks, A.Combustion],
        ])
      )
    ).eql(civ1['Rules/Player/research-complete.js']);
  });

  it("Rules/City/cost's maintenance (all but the Barracks' three steps)", (): void => {
    const rows = civ1['Rules/City/cost.js'],
      maintained = rows.slice(0, rows.length - 3);

    expect(
      fingerprint(
        maintenanceRules(
          maintained.map(() => [I.Temple, Gold as any, 1]),
          {}
        )
      )
    ).eql(maintained);

    // The Barracks' steps are the same rule with two criteria more: an advance known and one not.
    expect(
      fingerprint(
        maintenanceRules([[I.Barracks, Gold as any, 1]], undefined, {
          criteria: [new Criterion(() => true), new Criterion(() => true)],
        })
      )
    ).eql(rows.slice(-1));
  });

  it('Rules/City/build-priority', (): void => {
    expect(
      fingerprint(
        buildPriorityRules(
          'civ1-city-improvement',
          {
            needs: [
              'Granary',
              'Aqueduct',
              'Temple',
              'Colosseum',
              'Cathedral',
              'Marketplace',
              'Library',
              'Bank',
              'University',
              'Courthouse',
              'Factory',
            ].map((name) => [I[name], () => 0]),
            everydayImprovements: [],
            everyday: 0.1,
            withFactory: [
              'ManufacturingPlant',
              'HydroPlant',
              'NuclearPlant',
              'PowerPlant',
            ].map((name) => [I[name], 0.2]),
            factories: [I.Factory, I.ManufacturingPlant],
            forWar: [I.Barracks, I.CityWalls],
            warPriority: 100,
          },
          {
            Corruption: Yield,
            Food: Yield,
            Gold: Yield,
            Luxuries: Yield,
            Production: Yield,
            Research: Yield,
            Unhappiness: Yield,
          },
          () => 0
        )
      )
    ).eql(civ1['Rules/City/build-priority.js']);
  });
});
