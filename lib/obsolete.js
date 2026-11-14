"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obsoleteRules = void 0;
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const Engine_1 = require("@civ-clone/core-engine/Engine");
const Complete_1 = require("@civ-clone/core-science/Rules/Complete");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
/**
 * A `Complete` rule for each row of `table`: discovering the advance removes every one of the discovering player's
 * improvements of the type, and the engine is told (`city-improvement:obsolete`), even when there were none.
 */
const obsoleteRules = (table, { cityImprovementRegistry = CityImprovementRegistry_1.instance, cityRegistry = CityRegistry_1.instance, engine = Engine_1.instance, } = {}, { removed, idPrefix } = {}) => table.map(([Improvement, ObsoletingAdvance]) => new Complete_1.default(...(idPrefix === undefined
    ? []
    : [
        `${idPrefix}:player/research-complete/obsolete/${Improvement.name}/${ObsoletingAdvance.name}`,
    ]), new Criterion_1.default((playerResearch, advance) => advance instanceof ObsoletingAdvance), new Effect_1.default((playerResearch, advance) => {
    const player = playerResearch.player(), obsolete = cityRegistry
        .getByPlayer(player)
        .flatMap((city) => cityImprovementRegistry
        .getByCity(city)
        .filter((cityImprovement) => cityImprovement instanceof Improvement));
    obsolete.forEach((cityImprovement) => cityImprovement.destroy());
    removed === null || removed === void 0 ? void 0 : removed(player, Improvement, obsolete);
    engine.emit('city-improvement:obsolete', player, advance, Improvement, obsolete);
})));
exports.obsoleteRules = obsoleteRules;
exports.default = exports.obsoleteRules;
//# sourceMappingURL=obsolete.js.map