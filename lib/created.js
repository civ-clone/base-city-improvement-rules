"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createdRules = void 0;
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const Engine_1 = require("@civ-clone/core-engine/Engine");
const Created_1 = require("@civ-clone/core-city-improvement/Rules/Created");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const withId = (idPrefix, name) => idPrefix === undefined
    ? []
    : [`${idPrefix}:city-improvement/created/${name}`];
/**
 * What happens when an improvement is built, in order: it's registered; a new `Capital` destroys its player's other
 * ones (the capital moves); and the engine is told (`city-improvement:created`).
 */
const createdRules = ({ cityImprovementRegistry = CityImprovementRegistry_1.instance, engine = Engine_1.instance, }, { Capital, idPrefix }) => [
    new Created_1.default(...withId(idPrefix, 'register'), new Effect_1.default((cityImprovement) => cityImprovementRegistry.register(cityImprovement))),
    new Created_1.default(...withId(idPrefix, 'move-capital'), new Criterion_1.default((cityImprovement) => cityImprovement instanceof Capital), new Effect_1.default((capital, city) => cityImprovementRegistry
        .filter((cityImprovement) => cityImprovement instanceof Capital &&
        cityImprovement !== capital &&
        !cityImprovement.destroyed() &&
        cityImprovement.city().player() === city.player())
        .forEach((oldCapital) => oldCapital.destroy()))),
    new Created_1.default(...withId(idPrefix, 'emit'), new Effect_1.default((cityImprovement, city) => {
        engine.emit('city-improvement:created', cityImprovement, city);
    })),
];
exports.createdRules = createdRules;
exports.default = exports.createdRules;
//# sourceMappingURL=created.js.map