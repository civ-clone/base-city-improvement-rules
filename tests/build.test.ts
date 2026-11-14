import { buildRulesFor, notBuiltRule, siteRule } from '../lib/build';
import { built, cityOf, knowing } from './lib';
import Advance from '@civ-clone/core-science/Advance';
import { Build } from '@civ-clone/core-city-build/Rules/Build';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import CityImprovementRegistry from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import { Requirement } from '@civ-clone/core-requirement/Requirement';
import { expect } from 'chai';

class Temple extends CityImprovement {}
class Library extends CityImprovement {}
class University extends CityImprovement {}
class Courthouse extends CityImprovement {}
class Palace extends CityImprovement {}
class Writing extends Advance {}

const allows = (rule: Build, city: unknown, Item: unknown): boolean =>
  rule.validate(city as any, Item as any)
    ? (rule.process(city as any, Item as any) as any).validate()
    : true;

describe('lib/build', (): void => {
  it('notBuiltRule: an improvement is built once in each city', (): void => {
    const registry = new CityImprovementRegistry(),
      city = cityOf('p'),
      other = cityOf('p'),
      rule = notBuiltRule('x:not-built', registry);

    registry.register(built(Temple, city));

    expect(rule.id()).equal('x:not-built');
    expect(allows(rule, city, Temple)).false;
    expect(allows(rule, city, Library)).true;
    expect(allows(rule, other, Temple)).true;
  });

  it('buildRulesFor: an advance the player knows, an improvement in the city, or none of the excluding ones', (): void => {
    const registry = new CityImprovementRegistry(),
      city = cityOf('p'),
      [needsWriting] = buildRulesFor(
        new Requirement({
          id: 'x:library',
          subject: Library,
          relation: 'requires',
          targets: [Writing],
        }),
        registry,
        knowing()
      ),
      [needsLibrary] = buildRulesFor(
        new Requirement({
          id: 'x:university',
          subject: University,
          relation: 'requires',
          targets: [Library],
          mode: 'any',
          range: 'city',
        }),
        registry,
        knowing()
      ),
      [notWithPalace] = buildRulesFor(
        new Requirement({
          id: 'x:courthouse',
          subject: Courthouse,
          relation: 'excludedBy',
          targets: [Palace],
          mode: 'any',
          range: 'city',
        }),
        registry,
        knowing()
      );

    expect(needsWriting.id()).equal('x:library');
    expect(allows(needsWriting, city, Library)).false;
    // Only for its own subject.
    expect(allows(needsWriting, city, Temple)).true;
    expect(
      allows(
        buildRulesFor(
          new Requirement({
            id: 'x:library',
            subject: Library,
            relation: 'requires',
            targets: [Writing],
          }),
          registry,
          knowing(Writing)
        )[0],
        city,
        Library
      )
    ).true;

    expect(allows(needsLibrary, city, University)).false;
    expect(allows(notWithPalace, city, Courthouse)).true;

    registry.register(built(Library, city), built(Palace, city));

    expect(allows(needsLibrary, city, University)).true;
    expect(allows(notWithPalace, city, Courthouse)).false;
  });

  it('buildRulesFor: makes no rule for another relation', (): void => {
    expect(
      buildRulesFor(
        new Requirement({
          id: 'x:obsolete',
          subject: Library,
          relation: 'obsoletedBy',
          targets: [Writing],
        })
      )
    ).eql([]);
  });

  it('siteRule: only where the site holds, only for its improvement', (): void => {
    let ok = false;

    const city = cityOf('p'),
      rule = siteRule('x:site', Temple, () => ok);

    expect(allows(rule, city, Temple)).false;
    expect(allows(rule, city, Library)).true;

    ok = true;

    expect(allows(rule, city, Temple)).true;
  });
});
