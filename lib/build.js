"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deriveBuildRules = exports.buildRulesFor = exports.siteRule = exports.notBuiltRule = void 0;
const Build_1 = require("@civ-clone/core-city-build/Rules/Build");
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const Requirement_1 = require("@civ-clone/core-requirement/Requirement");
const CityImprovement_1 = require("@civ-clone/core-city-improvement/CityImprovement");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
/** An improvement is built once in each city: a state of the city, so a rule written by hand, with the ruleset's `id`. */
const notBuiltRule = (id, cityImprovementRegistry = CityImprovementRegistry_1.instance) => new Build_1.Build(id, CityImprovement_1.default, new Effect_1.default((city, BuildItem) => new Criterion_1.default(() => !cityImprovementRegistry
    .getByCity(city)
    .some((improvement) => improvement instanceof BuildItem))));
exports.notBuiltRule = notBuiltRule;
/**
 * A city may build `Improvement` only where `site(city)` holds: a state of the map (a Hydro Plant's mountains or river,
 *  a Harbour's coast), so a rule written by hand, with the ruleset's `id`.
 */
const siteRule = (id, Improvement, site) => new Build_1.Build(id, Improvement, new Criterion_1.default((city, BuildItem) => BuildItem === Improvement), new Effect_1.default((city) => new Criterion_1.default(() => site(city))));
exports.siteRule = siteRule;
const isImprovement = (target) => Object.prototype.isPrototypeOf.call(CityImprovement_1.default, target);
/**
 * The rule `entry` is played by: a city may build its subject only while its targets are met (`requires`), or only
 * while they are not (`excludedBy`). A target that is an improvement is met by the city having one; any other is an
 * advance, met by the city's player having discovered it. Other relations make no rule.
 */
const buildRulesFor = (entry, cityImprovementRegistry = CityImprovementRegistry_1.instance, playerResearchRegistry = PlayerResearchRegistry_1.instance) => {
    if (entry.relation !== 'requires' && entry.relation !== 'excludedBy') {
        return [];
    }
    const excluded = entry.relation === 'excludedBy', 
    // Worked out once here rather than each time the rule runs, as `available()` runs it for every item every turn.
    improvementTargets = new Set(entry.targets.filter(isImprovement));
    return [
        new Build_1.Build(entry.id, entry.subject, new Criterion_1.default((city, BuildItem) => BuildItem === entry.subject), new Effect_1.default((city) => new Criterion_1.default(() => {
            let improvements = null;
            const targetsMet = (0, Requirement_1.met)(entry, (target) => {
                if (!improvementTargets.has(target)) {
                    return playerResearchRegistry
                        .getByPlayer(city.player())
                        .completed(target);
                }
                if (improvements === null) {
                    improvements = cityImprovementRegistry.getByCity(city);
                }
                return improvements.some((improvement) => improvement instanceof target);
            });
            return excluded ? !targetsMet : targetsMet;
        }))),
    ];
};
exports.buildRulesFor = buildRulesFor;
/** What a ruleset gives the game's `requirements` to make each entry's rules with. */
const deriveBuildRules = (cityImprovementRegistry, playerResearchRegistry) => (entry) => (0, exports.buildRulesFor)(entry, cityImprovementRegistry, playerResearchRegistry);
exports.deriveBuildRules = deriveBuildRules;
//# sourceMappingURL=build.js.map